import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pypdf import PdfReader
from docx import Document

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint, ChatHuggingFace
from langchain_core.prompts import ChatPromptTemplate


load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct"

UPLOAD_DIR = Path("uploads")
CHROMA_DIR = Path("data/chroma")

UPLOAD_DIR.mkdir(exist_ok=True)
CHROMA_DIR.parent.mkdir(exist_ok=True)


app = FastAPI(title="AI Interview System Demo")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_resume_text(file_path):
    extension = file_path.suffix.lower()

    if extension == ".pdf":
        reader = PdfReader(str(file_path))

        text = ""

        for page in reader.pages:
            text += page.extract_text() or ""
            text += "\n"

        return text

    if extension == ".docx":
        document = Document(str(file_path))

        text = ""

        for paragraph in document.paragraphs:
            text += paragraph.text + "\n"

        return text

    raise ValueError("Only PDF and DOCX files are supported.")


def create_vector_database(resume_text):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )

    documents = splitter.create_documents([resume_text])

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    if CHROMA_DIR.exists():
        shutil.rmtree(CHROMA_DIR)

    vectorstore = Chroma(
        collection_name="resume_collection",
        embedding_function=embeddings,
        persist_directory=str(CHROMA_DIR)
    )

    vectorstore.add_documents(documents)

    return vectorstore


def generate_first_question(vectorstore):

    retriever = vectorstore.as_retriever(
        search_kwargs={"k": 4}
    )

    retrieved_documents = retriever.invoke(
        "candidate resume"
    )

    context = "\n\n".join(
        document.page_content
        for document in retrieved_documents
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are an AI interviewer starting an interview.

This is the FIRST interaction of the interview.

Your ONLY task is to ask the candidate to introduce themselves.

Do NOT summarize the resume.
Do NOT mention anything from the resume.
Do NOT mention the candidate's name.
Do NOT mention education.
Do NOT mention skills.
Do NOT mention projects.
Do NOT mention companies.
Do NOT mention work experience.
Do NOT mention any resume information.
Do NOT ask a technical question.
Do NOT ask any follow-up question.
Do NOT generate multiple questions.
Do NOT explain your reasoning.
Do NOT provide analysis.

Return ONLY this exact sentence:

Let's start with your introduction. Could you please introduce yourself?
"""
            ),
            (
                "human",
                """
The candidate's resume has already been processed and stored
in the vector database.

Resume context:

{context}

Generate the first interview question according to the system instructions.
"""
            )
        ]
    )

    llm = HuggingFaceEndpoint(
        repo_id=MODEL_NAME,
        task="text-generation",
        max_new_tokens=50,
        temperature=0.0,
        huggingfacehub_api_token=HF_TOKEN
    )

    chat_model = ChatHuggingFace(llm=llm)

    chain = prompt | chat_model

    response = chain.invoke(
        {
            "context": context
        }
    )

    return response.content.strip()


@app.get("/")
def home():

    return {
        "message": "AI Interview Backend is running"
    }


@app.post("/api/interview/start")
async def start_interview(
    resume: UploadFile = File(...)
):

    if not resume.filename:
        raise HTTPException(
            status_code=400,
            detail="Resume file is required."
        )

    extension = Path(resume.filename).suffix.lower()

    if extension not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    file_path = UPLOAD_DIR / resume.filename

    with open(file_path, "wb") as file:
        file.write(await resume.read())

    try:

        resume_text = extract_resume_text(
            file_path
        )

        if not resume_text.strip():

            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the resume."
            )

        vectorstore = create_vector_database(
            resume_text
        )

        question = generate_first_question(
            vectorstore
        )

        return {
            "success": True,
            "question": question
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )