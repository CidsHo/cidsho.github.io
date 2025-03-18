using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ForcePlayerForward : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        // Directly set the rotation of the player to face forward along the world Z-axis
        // This ignores any tilt or roll, maintaining any existing pitch (looking up or down)
        Vector3 forwardDirection = new Vector3(0, transform.eulerAngles.y, 0);
        transform.eulerAngles = forwardDirection;
    }
}
