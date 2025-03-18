using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FollowControllerXY : MonoBehaviour
{
    public Transform controllerTransform;
    public Transform leftControllerTransform;
    public Transform rightControllerTransform;
    private Vector3 lastValidPosition;
    public float maxControllerDistanceX = 2.0f; // Maximum distance in meters for X-axis
    public float maxControllerDistanceY = 2.0f; // Maximum distance in meters for Y-axis

    void Start()
    {
        // Store the initial position of the object as the last valid position
        lastValidPosition = transform.position;
    }

    void Update()
    {
        if (controllerTransform != null && leftControllerTransform != null && rightControllerTransform != null)
        {
            // Calculate the absolute differences in both the X and Y axes
            float distanceBetweenControllersX = Mathf.Abs(leftControllerTransform.position.x - rightControllerTransform.position.x);
            float distanceBetweenControllersY = Mathf.Abs(leftControllerTransform.position.y - rightControllerTransform.position.y);

            // Check if the distance exceeds the threshold in either axis
            if (distanceBetweenControllersX <= maxControllerDistanceX && distanceBetweenControllersY <= maxControllerDistanceY)
            {
                // Follow the controller's movement if within thresholds
                transform.position = new Vector3(controllerTransform.position.x, controllerTransform.position.y, lastValidPosition.z);
                // Update the last valid position
                lastValidPosition = transform.position;
            }
            else
            {
                // Stay at the last valid position if either threshold is exceeded
                transform.position = lastValidPosition;
            }
        }
    }
}
