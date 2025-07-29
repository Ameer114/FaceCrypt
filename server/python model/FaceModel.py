import cv2
import numpy as np
import face_recognition
import os
import requests
import time
from datetime import datetime
import threading

# Path to the directory containing the images
path = './KnownFaces'
print("Current working directory:", os.getcwd())
# List to hold images and corresponding class names
images = []
classNames = []

# Load the images and class names
myList = os.listdir(path)
print(myList)
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    images.append(curImg)
    classNames.append(os.path.splitext(cl)[0])
print(classNames)

def findEncodings(images):
    """Encodes the given images using face_recognition library."""
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList

def markAttendance(name):
    """Marks attendance by writing the name, time, and date to Attendance.csv."""
    with open('Attendance.csv', 'r+') as f:
        myDataList = f.readlines()
        nameList = []
        for line in myDataList:
            entry = line.split(',')
            nameList.append(entry[0])
       
        time_now = datetime.now()
        tString = time_now.strftime('%H:%M:%S')
        dString = time_now.strftime('%d/%m/%Y')
        f.writelines(f'\n{name},{tString},{dString}')

# Find encodings of known faces
encodeListKnown = findEncodings(images)
print('Encoding Complete')

# Capture video from the webcam
cap = cv2.VideoCapture(0)


# NEW: Track the last person and time seen
last_person = None
last_time_seen = 0

while True:
    success, img = cap.read()
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

    facesCurFrame = face_recognition.face_locations(imgS)
    encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

    for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
        faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
        print(faceDis)
        matchIndex = np.argmin(faceDis)

        if matches[matchIndex]:
            name = classNames[matchIndex].upper()
            print(name)
            y1, x2, y2, x1 = faceLoc
            y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
            cv2.putText(img, name, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)
            current_time = time.time()

            if name == last_person and (current_time - last_time_seen) <= 2:
                print(f"Skipping {name} (same as last and within 2s)")
                last_person = name
                last_time_seen = current_time
            else:
                def handle_attendance_and_request(name):
                    try:
                        requests.get("http://192.168.81.130/toggle")
                        print(f"✅ Request sent for: {name}")
                        markAttendance(name)
                    except Exception as e:
                        print(f"Error: {e}")

                # Then call this inside your main loop
                threading.Thread(target=handle_attendance_and_request, args=(name,)).start()



            # ✅ Mark attendance
            
        else:
            print("Unknown")
            ret, frame = cap.read()
            cv2.imwrite("captured_image.jpg", frame)
            print("Image captured and saved as captured_image.jpg")
            filename = "./captured_image.jpg"
            with open(filename, "rb") as f:
                img_bytes = f.read()

            url = "http://localhost:5000/upload"
            headers = {"Content-Type": "image/jpeg"}
            def send_image_async(img_bytes, url, headers):
                try:
                    response = requests.post(url, data=img_bytes, headers=headers)
                    print(response.text)  # Server response
                except requests.exceptions.RequestException as e:
                    print(f"Error sending request: {e}")

            threading.Thread(target=send_image_async, args=(img_bytes, url, headers)).start()



            time.sleep(2)


    cv2.imshow('Webcam', img)
    if cv2.waitKey(10) == 13:  # Exit on Enter key
        break

cap.release()
cv2.destroyAllWindows()