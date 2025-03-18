using UnityEngine;

public class MoveWithElevation : MonoBehaviour
{
    public Transform playerCamera; // Assign the player's camera in the inspector
    public float movementScale = 1.0f; // Scale factor for overall movement
    public float rangeScale = 1.0f; // Scale to adjust min and max movement offset dynamically

    private Vector3 initialPosition; // Store the initial global position

    void Start()
    {
        // Store the initial global position of the object
        initialPosition = transform.position;
    }

    void Update()
    {
        if (playerCamera == null) return;

        // Calculate elevation angle
        float elevationAngle = Vector3.SignedAngle(playerCamera.forward, Vector3.forward, Vector3.right);

        // Normalize the elevation angle to a value between 0 and 1
        float normalizedAngle = (elevationAngle + 90) / 180;

        // Dynamically calculate the min and max offsets based on the rangeScale
        float dynamicMinOffset = -0.4f * rangeScale;
        float dynamicMaxOffset = 0.8f * rangeScale;

        // Calculate the X position offset using the normalized angle, applying the movement scale
        float xPositionOffset = Mathf.Lerp(dynamicMinOffset, dynamicMaxOffset, normalizedAngle) * movementScale;

        // Update the object's global position directly
        transform.position = new Vector3(initialPosition.x + xPositionOffset, transform.position.y, transform.position.z);
    }
}
