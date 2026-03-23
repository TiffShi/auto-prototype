import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

def test_connection():
    print("Loading environment variables...")
    # This automatically finds your .env file and loads the variables
    load_dotenv()
    
    # Check if the key was actually pulled into the environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Error: OPENAI_API_KEY not found. Please check your .env file.")
        return
        
    print("API Key found. Testing connection to OpenAI via LangChain...")
    
    try:
        # Initialize the LangChain Chat model
        llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
        
        # Send a simple prompt
        response = llm.invoke("Say 'Hello AutoProtoype! The LangChain connection is active.'")
        
        print("\n --- Success --- ")
        print("LLM Response:", response.content)
        
    except Exception as e:
        print("\n --- Connection Failed --- ")
        print(f"Error details: {e}")

if __name__ == "__main__":
    test_connection()