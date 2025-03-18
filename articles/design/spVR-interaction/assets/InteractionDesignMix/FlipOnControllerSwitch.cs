using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FlipOnControllerSwitch : MonoBehaviour
{
    public Transform objectA; // Assign the first object in the inspector
    public Transform objectB; // Assign the second object in the inspector
    public float minimumDistanceForFlip = 1.0f; // Minimum distance between objects to allow a flip
    public float distanceScale = 1.0f; // Scale to adjust the minimum distance dynamically

    private bool isFlipped = false;

    void Update()
    {
        // Calculate the actual minimum distance taking into account the distance scale
        float scaledMinimumDistance = minimumDistanceForFlip * distanceScale;

        // Determine if objectA is to the right of objectB
        bool objectAIsRightOfObjectB = objectA.position.x > objectB.position.x;

        // Calculate the distance between the two objects
        float distanceBetweenObjects = Vector3.Distance(objectA.position, objectB.position);

        // Check if the condition to flip or flip back is met and the distance exceeds the scaled minimum distance
        if (objectAIsRightOfObjectB && !isFlipped && distanceBetweenObjects > scaledMinimumDistance)
        {
            // If the object is not flipped, needs to be flipped, and the distance condition is met, rotate it
            FlipObject();
        }
        else if (!objectAIsRightOfObjectB && isFlipped && distanceBetweenObjects > scaledMinimumDistance)
        {
            // If the object is flipped, needs to be flipped back, and the distance condition is met, rotate it
            FlipObject();
        }
    }

    // This method flips the object by rotating it 180 degrees around the Y axis
    void FlipObject()
    {
        transform.Rotate(0, 180f, 0, Space.World);
        // Toggle the flipped state
        isFlipped = !isFlipped;
    }
}
