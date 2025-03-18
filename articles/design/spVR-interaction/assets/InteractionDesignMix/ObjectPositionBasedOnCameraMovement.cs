using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ObjectPositionBasedOnCameraMovement : MonoBehaviour
{
    public Transform playerCamera; // Assign the player's camera in the inspector
    public float movementScaleX = 1.0f; // Scale factor for movement along the X-axis
    public float movementScaleY = 1.0f; // Scale factor for movement along the Y-axis

    private Vector3 initialCameraPosition; // To store the initial position of the camera
    private Vector3 initialObjectPosition; // To store the initial position of the object

    void Start()
    {
        if (playerCamera != null)
        {
            initialCameraPosition = playerCamera.position;
        }
        else
        {
            Debug.LogError("Player Camera is not assigned.");
        }

        initialObjectPosition = transform.position;
    }

    void Update()
    {
        if (playerCamera == null) return;

        Vector3 cameraMovement = playerCamera.position - initialCameraPosition;
        // Apply the camera's movement to the object, scaled by the movement scale factors
        Vector3 newObjectPosition = initialObjectPosition + new Vector3(cameraMovement.x * movementScaleX, cameraMovement.y * movementScaleY, 0);

        transform.position = new Vector3(newObjectPosition.x, newObjectPosition.y, transform.position.z); // Maintain initial Z position
    }
}
