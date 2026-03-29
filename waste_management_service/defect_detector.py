import cv2
import numpy as np
from ultralytics import YOLO
import os

class DefectDetector:
    def __init__(self, model_path="yolov8n.pt"):
        """
        Initialize the YOLOv8 model for defect detection.
        If model_path doesn't exist, it will download the pre-trained nano model.
        """
        self.model = YOLO(model_path)
        # Custom labels for a garment defect system (example)
        self.target_names = ["Hole", "Stain", "Tear", "Oil Point"]
        
    def detect(self, img_source):
        """
        Detect defects in an image or frame.
        Returns detections as list of dicts.
        """
        results = self.model(img_source)[0]
        detections = []
        
        for box in results.boxes:
            # Extract box data
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = results.names[cls_id]
            
            detections.append({
                "label": label,
                "confidence": round(conf, 2),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)]
            })
            
        return detections, results.plot()

    def detect_and_draw(self, img_source):
        """
        Runs detection and returns a base64 encoded image or raw numpy array with boxes drawn.
        """
        detections, plotted_img = self.detect(img_source)
        return detections, plotted_img

if __name__ == "__main__":
    # Test locally if a sample image exists
    detector = DefectDetector()
    print("Model loaded successfully.")
