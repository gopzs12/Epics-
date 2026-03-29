from ultralytics import YOLO
import argparse
import os

def train_custom_model(data_yaml, epochs=50, imgsz=640, model_type="yolov8n.pt"):
    """
    Train a YOLOv8 model on custom defect data.
    
    Args:
        data_yaml: Path to your dataset's YAML file (defines classes and paths).
        epochs: Number of training iterations.
        imgsz: Image size for training.
        model_type: Pre-trained model to start from (Transfer Learning).
    """
    # 1. Load the pre-trained model (Transfer Learning)
    # This uses the weights learned by the model on millions of images.
    model = YOLO(model_type)

    # 2. Start the Training
    # YAML file should look like:
    #   path: ../datasets/defect_data
    #   train: images/train
    #   val: images/val
    #   names:
    #     0: tear
    #     1: stain
    results = model.train(
        data=data_yaml, 
        epochs=epochs, 
        imgsz=imgsz, 
        plots=True,
        project="defect_detection_project",
        name="fabric_defects"
    )
    
    # 3. Validation
    # Automatically runs validation after training is complete.
    metrics = model.val()
    
    print(f"Training complete! Best weights at: {results.save_dir}/weights/best.pt")
    return results

if __name__ == "__main__":
    # Example usage:
    # python train_defect_detector.py --data dataset.yaml --epochs 100
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=str, default="coco8.yaml", help="Path to data.yaml")
    parser.add_argument("--epochs", type=int, default=5, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image size")
    
    args = parser.parse_args()
    
    # NOTE: coco8 is a tiny sample dataset provided by Ultralytics for testing logic.
    train_custom_model(args.data, args.epochs, args.imgsz)
