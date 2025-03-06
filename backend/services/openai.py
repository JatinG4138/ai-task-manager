# import openai
# from typing import Dict, List, Optional
# from datetime import datetime, timedelta
# from services.config import settings

# class OpenAIService:
#     def __init__(self):
#         openai.api_key = settings.OPENAI_KEY

#     async def analyze_task(self, task_data: Dict) -> Dict:

#         # title = task_data.title
#         description = task_data.description
#         due_date = task_data.due_date
#         now = datetime.now()

#         prompt = f"""
#     You are an AI task manager assistant. Prioritize the task based on:
#     1. The due date.
#     2. The importance of the task.
#     3. Urgency indicators like "ASAP", "critical", or "optional".
#     4. Dependencies (e.g., a meeting tomorrow requires preparation today).

#     Task: {description}
#     Due Date: {due_date}
#     Today's Date: {now.strftime('%Y-%m-%d')}

#     Assign a priority label:
#     - "Urgent" if it is extremely time-sensitive.
#     - "High Priority" if it is important but not immediately urgent.
#     - "Medium Priority" if it can wait but should be done soon.
#     - "Low Priority" if it is not urgent or critical.

#     Return only the priority label and task summary.
#         """

#         # try:
#         if True:

#             response = await openai.ChatCompletion.acreate(
#                 model="gpt-3.5-turbo",
#                 messages=[
#                     {
#                         "role": "system",
#                         "content": "You are a helpful assistant that analyzes tasks and provides tags, priority scores, and summaries in JSON format only.",
#                     },
#                     {"role": "user", "content": prompt},
#                 ],
#                 temperature=0.3,
#                 max_tokens=300,
#             )
#             response = openai.ChatCompletion.create(
#                 model="gpt-3.5-turbo", messages=[{"role": "user", "content": prompt}]
#             )

#             priority_tag = response["choices"][0]["message"]["content"].strip()
#             return priority_tag

#         # except Exception as e:
#         #     return {"tag": ["task"]}


# openai_service = OpenAIService()

import google.generativeai as genai
from typing import Dict
from datetime import datetime
from services.config import settings
from schemas.schema import CreateTaskSchema

class GeminiAIService:
    def __init__(self):
        genai.configure(api_key="AIzaSyC8N6GzYftNmAudn9II-PGG973ZksBIyTU")
        self.model = genai.GenerativeModel("gemini-1.5-pro-latest")

    async def analyze_task(self, task_data: CreateTaskSchema) -> Dict:
        description = task_data.description
        due_date = task_data.due_date
        now = datetime.now().strftime("%Y-%m-%d")

        prompt = f"""
        You are an AI task manager assistant. Prioritize the task based on:
        1. The due date.
        2. The importance of the task.
        3. Urgency indicators like "ASAP", "critical", or "optional".
        4. Dependencies (e.g., a meeting tomorrow requires preparation today).

        Task: {description}
        Due Date: {due_date}
        Today's Date: {now}

        Assign a priority label:
        - "Urgent" if it is extremely time-sensitive.
        - "High" if it is important but not immediately urgent.
        - "Medium" if it can wait but should be done soon.
        - "Low" if it is not urgent or critical.

        Return only the priority label and task summary in a list.
        LIKE:  [priority , task_summary]

        """

        try:
            response = self.model.generate_content(prompt)
            priority_tag = response.text.strip()
            return priority_tag
        except Exception as e:
            return {"priority": "Error", "message": str(e)}


# Initialize the service
gemini_service = GeminiAIService()
