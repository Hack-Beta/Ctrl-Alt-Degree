import openai
from dotenv import load_dotenv
import os
import json
import re
from collections import deque

load_dotenv()
my_api_key = os.getenv("KEY")

class LocalLLM:
    def __init__(self, host_ip, port_num, api_key_str):
        self.client = openai.Client(base_url=f"http://{host_ip}:{port_num}/v1", api_key=api_key_str)
        self.model_name = self.client.models.list().data[0].id

        self.history = deque(maxlen=20)
        self.facts = set()
        self.summary = ""  # summarized long-term memory
        print("Model loaded:", self.model_name)

    def append_to_history(self, role: str, data: str):
        self.history.append({"role": role, "content": data})

    def add_fact(self, fact: str):
        self.facts.add(fact)

    def update_summary(self):
        # Summarize older history to fit in longer context
        if len(self.history) > 10:
            summary_prompt = [
                {"role": "system", "content": "Summarize the following conversation for memory retention:"},
                *list(self.history)[:-10],
                {"role": "user", "content": "Please summarize everything above in 100 words or less."}
            ]
            try:
                summary_response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=summary_prompt,
                    temperature=0.3
                )
                self.summary = summary_response.choices[0].message.content.strip()
            except Exception as e:
                print("Error updating summary:", e)
                self.summary = ""

    def generate_fact_prompt(self):
        if not self.facts:
            return ""
        return "The following facts should be kept in mind during this conversation:\n- " + "\n- ".join(sorted(self.facts))

    def get_response(self, message):
        self.append_to_history("user", message)
        self.update_summary()

        messages = []
        if self.summary:
            messages.append({"role": "system", "content": f"Summary of past conversation: {self.summary}"})

        fact_prompt = self.generate_fact_prompt()
        if fact_prompt:
            messages.append({"role": "system", "content": fact_prompt})

        # Include only the most recent history for clarity
        messages.extend(list(self.history)[-10:])

        try:
            response_stream = self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=0.5,
                top_p=0.9,
                stream=True,
            )
        except Exception as e:
            print("Error getting response:", e)
            return "", ""

        reasoning = ""
        answer = ""
        has_content_started = False
        has_reason_started = False

        # Process streaming response with error checking
        for chunk in response_stream:
            delta = chunk.choices[0].delta
            # Check if the custom attribute exists (if not, rely on content)
            if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                if not has_reason_started:
                    has_reason_started = True
                    print("\n~~~ BEGINNING OF REASONING ~~~")
                print(delta.reasoning_content, end="")
                reasoning += delta.reasoning_content
            elif hasattr(delta, 'content') and delta.content:
                if not has_content_started:
                    has_content_started = True
                    print("\n~~~ END OF REASONING ~~~")
                    print("\n~~~ BEGINNING OF ANSWER ~~~")
                print(delta.content, end="")
                answer += delta.content

        print("\n~~~ END OF ANSWER ~~~")
        self.append_to_history("assistant", answer)
        return answer, reasoning

def extract_courses(user_input):
    # Define a regular expression pattern:
    # \b - word boundary
    # [A-Za-z]+ - one or more letters (for the course prefix)
    # \s* - optional spaces
    # \d{3} - exactly three digits (for the course number)
    # \b - word boundary
    pattern = r'\b[A-Za-z]+\s*\d{3}\b'
    
    # Use re.findall to get all occurrences matching the pattern
    courses = re.findall(pattern, user_input)
    return courses

# New function for app.py to call
def process_prompt(prompt_text):
    """
    Process a user prompt with the AI advisor
    
    Args:
        prompt_text: The user's question or request
        
    Returns:
        dict: A dictionary containing the response, reasoning, and original prompt
    """
    # Initialize the AI model
    llm = LocalLLM("172.30.80.17", 50001, my_api_key)
    
    with open("advisor_system_prompt.txt") as f:
        system_prompt = f.read()
    
    # Set up the system prompt
    llm.append_to_history("system", system_prompt)
    
    # Get response from the model
    answer, reasoning = llm.get_response(prompt_text)
    
    # Return the results as a dictionary
    return {
        'response': answer,
        'reasoning': reasoning,
        'original_prompt': prompt_text
    }