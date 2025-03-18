using UnityEngine;

public class MoveObjectWithController : MonoBehaviour
{
    public Transform controllerTransform; // Assign the controller in the Inspector
    public Transform objectToMove; // Assign the object you want to move in the Inspector
    public bool followPosition = true; // Whether the object should follow the controller's position
    public bool followRotation = true; // Whether the object should follow the controller's rotation

    // Optional: Use these if you want to offset the position/rotation
    public Vector3 positionOffset;
    public Vector3 rotationOffset;

    void Update()
    {
        if (controllerTransform == null || objectToMove == null)
        {
            Debug.LogWarning("Controller Transform and/or Object to Move is not assigned.");
            return;
        }

        // Make the object follow the controller's position, with an optional offset
        if (followPosition)
        {
            objectToMove.position = controllerTransform.position + positionOffset;
        }

        // Make the object follow the controller's rotation, with an optional offset
        if (followRotation)
        {
            objectToMove.rotation = Quaternion.Euler(controllerTransform.eulerAngles + rotationOffset);
        }
    }
}
