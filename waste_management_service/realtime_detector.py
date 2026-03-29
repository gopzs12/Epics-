import cv2
from defect_detector import DefectDetector
import time

def run_realtime_detection():
    """
    Opens the default webcam and runs YOLOv8 defect detection in real-time.
    Press 'q' to exit.
    """
    # Initialize the model (it will download weights if not present)
    detector = DefectDetector(model_path="yolov8n.pt")
    
    # Open webcam (0 is typically the default integrated camera)
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    print("Camera active. Press 'q' to stop.")
    
    # Simple frame rate calculation
    prev_time = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # 1. Run inference on the current frame
        detections, plotted_frame = detector.detect(frame)
        
        # 2. Add FPS to the frame
        curr_time = time.time()
        fps = 1 / (curr_time - prev_time)
        prev_time = curr_time
        
        cv2.putText(plotted_frame, f"FPS: {int(fps)}", (20, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        
        # 3. Show detections in a window
        cv2.imshow("GarmentLink — Real-time Defect Detection", plotted_frame)
        
        # Check for 'q' key to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    run_realtime_detection()
