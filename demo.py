# import asyncio
# import socketio

# sio = socketio.AsyncClient()


# # async def main():
# #     await sio.connect("http://localhost:8000/socket.io/", transports=["websocket"])

# #     # Send "add_task" event
# #     await sio.emit(
# #         "add_task",
# #         {
# #             "title": "Implement Socket.IO in Python",
# #             "description": "Handle task addition via WebSocket",
# #             "status": "in-progress",
# #             "due_date": "2025-03-06",
# #             "tag": "backend",
# #             "summary": "Use Socket.IO to handle real-time task creation",
# #             "user_id":1
# #         },
# #     )

# #     @sio.on("task_added")
# #     async def on_task_added(data):
# #         print("🆕 New Task Added:", data)

# #     @sio.on("task_error")
# #     async def on_task_error(error):
# #         print("❌ Error:", error)

# #     await sio.wait()


# async def main():
#     await sio.connect("http://localhost:8000/socket.io/", transports=["websocket"])

#     # Send "delete_task" event
#     await sio.emit(
#         "delete_task",
#         {"id": 2, "user_id": 1},  # Task ID  # Ensure user ID is included
#     )

#     @sio.on("task_deleted")
#     async def on_task_deleted(data):
#         print("🗑️ Task Deleted:", data)

#     @sio.on("task_error")
#     async def on_task_error(error):
#         print("❌ Error:", error)

#     await sio.wait()


# asyncio.run(main())


import google.generativeai as genai

# Set up the API key
genai.configure(api_key="AIzaSyC8N6GzYftNmAudn9II-PGG973ZksBIyTU")

# Initialize the model
model = genai.GenerativeModel("gemini-1.5-pro-latest")

# Generate a response
response = model.generate_content("Tell me a fun fact about space.")
print(response.text)
