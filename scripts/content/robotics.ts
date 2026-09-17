import type { CourseContentData } from "./types";

const data: CourseContentData = {
  courseSlug: "robotics",
  modules: [
    {
      moduleTitle: "Fundamentals of Robotics",
      sections: [
        {
          heading: "What Is a Robot?",
          body: "A robot is a programmable machine that senses its environment, makes decisions based on that information, and acts on the physical world through motion or manipulation. Every robot, from a simple line-following cart to an industrial arm, is built from the same three functional blocks: sensing (gathering information about the world), processing (deciding what to do with that information), and actuation (turning decisions into physical motion). Understanding this sense-think-act loop is the foundation for everything else in robotics — every topic in this course is really about building or improving one of these three blocks.",
        },
        {
          heading: "Types of Robots",
          body: "Robots are usually grouped by how they move and what they're built to do:",
          bullets: [
            "Mobile robots — move through an environment on wheels, tracks, or legs (e.g. delivery robots, vacuum cleaners, rovers).",
            "Robotic arms / manipulators — fixed at a base, move an end effector through space to grip, weld, or assemble (common in factories).",
            "Humanoid robots — designed to mimic human form and movement, used in research and human-interaction settings.",
            "Drones (aerial robots) — fly using rotors or fixed wings, controlled by an onboard flight computer.",
            "Autonomous vs. teleoperated — autonomous robots decide their own actions from sensor data; teleoperated robots are directly controlled by a human operator.",
          ],
        },
        {
          heading: "Basic Mechanics: Degrees of Freedom",
          body: "A robot's degrees of freedom (DOF) describe the number of independent ways it can move. A wheeled cart moving on a flat floor typically has 2-3 DOF (forward/back, turn, and sometimes strafe). A robotic arm used in manufacturing commonly has 6 DOF — enough to position and orient an object anywhere within its reach, the same number of independent motions a human arm and wrist provide. More DOF means more flexibility in movement, but also more motors, more computation, and more that can go wrong — good robot design finds the minimum DOF that gets the job done reliably.",
        },
        {
          heading: "Kinematics: Describing Motion",
          body: "Kinematics is the study of motion without worrying about the forces that cause it — essentially the geometry of how a robot's joints relate to where its end effector (hand, tool, or wheel contact point) ends up in space.",
          bullets: [
            "Forward kinematics: given the angles/positions of every joint, calculate where the end effector is. This is the easier direction — it's just applying geometry joint by joint.",
            "Inverse kinematics: given a target position for the end effector, calculate what each joint angle needs to be. This is harder — there can be multiple valid solutions, or none at all if the target is out of reach.",
            "Workspace: the full set of points a robot's end effector can physically reach, shaped by its link lengths and joint limits.",
          ],
        },
        {
          heading: "Center of Gravity and Stability",
          body: "For any robot that has to stay upright — mobile robots, legged robots, drones on landing — the center of gravity (CG) matters as much as the mechanics. A robot is statically stable if its CG stays within its base of support (the area enclosed by its wheels or feet touching the ground) at all times. Robots with a narrow wheelbase or a high CG (like a tall robot with heavy components mounted up top) tip over more easily on turns or uneven ground. This is why real robot designs keep batteries and heavy motors low and centered whenever possible.",
        },
        {
          heading: "Robotics Safety Basics",
          body: "Robots combine moving parts, electrical power, and often autonomous decision-making — all three are sources of real risk if ignored. Safe practice starts before you ever power on a robot:",
          bullets: [
            "Always identify pinch points (where a joint or wheel can trap a hand or clothing) before running any motor for the first time.",
            "Keep a clear, immediate way to cut power — a physical emergency-stop switch, not just a software 'stop' command, since software can hang or lose connection.",
            "Test new code or mechanisms with the robot propped up off the ground (wheels spinning freely) before letting it move under its own power.",
            "Never work on a robot's electrical or motor system while it's powered — disconnect the battery first.",
            "For anything with exposed high torque (arms, grippers), assume it's strong enough to injure a hand and treat it accordingly, even at 'low' power settings.",
          ],
        },
      ],
      links: [
        { label: "MIT OpenCourseWare — Introduction to Robotics", url: "https://ocw.mit.edu/" },
        { label: "GeeksforGeeks — Robotics Basics", url: "https://www.geeksforgeeks.org/robotics/introduction-to-robotics/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
    {
      moduleTitle: "Sensors & Actuators",
      sections: [
        {
          heading: "Why Sensors Matter",
          body: "A robot without sensors is just a machine executing a fixed sequence blindly — it can't react to anything unexpected. Sensors are what let a robot perceive its environment and its own state, closing the loop between 'what I planned to do' and 'what's actually happening.' Choosing the right sensor for a job is one of the most consequential decisions in a robot's design, because it directly limits what the robot can ever know about the world.",
        },
        {
          heading: "Common Sensor Types",
          body: "Sensors used in robotics generally fall into a few families, each answering a different question:",
          bullets: [
            "Proximity/distance sensors (ultrasonic, infrared, LiDAR) — 'how far is the nearest object?' Used for obstacle avoidance and mapping.",
            "Touch/contact sensors (limit switches, bump sensors, force-sensitive resistors) — 'did I just touch or collide with something?'",
            "Light sensors (photoresistors, IR reflectance sensors) — used for line-following and detecting light/dark surfaces.",
            "Inertial sensors (accelerometers, gyroscopes, combined in an IMU) — 'how am I oriented, and how am I accelerating or rotating?' Critical for balance and navigation.",
            "Encoders — measure how far a motor shaft or wheel has rotated, letting the robot estimate distance traveled (odometry).",
            "Cameras / vision sensors — capture images for more complex perception like object recognition or line detection with more detail than a simple light sensor.",
          ],
        },
        {
          heading: "Motors and Actuators",
          body: "Actuators are the components that convert electrical energy into physical motion or force — they're the robot's muscles. The right choice depends on the type of motion needed and how precisely it must be controlled:",
          bullets: [
            "DC motors — simple, continuous rotation, speed roughly proportional to voltage; common for driving wheels.",
            "Servo motors — DC motors with built-in position feedback and control circuitry, allowing precise angle control (commonly 0-180°); used for joints and steering.",
            "Stepper motors — move in fixed, precise increments ('steps') per electrical pulse, giving accurate position control without needing a feedback sensor; common in 3D printers and camera gimbals.",
            "Solenoids — simple electromagnetic actuators that produce linear push/pull motion, often used for grippers or latches.",
            "Motor drivers/H-bridges — the electronic circuit between a low-power microcontroller and a higher-power motor, needed because microcontroller pins can't supply enough current to run a motor directly.",
          ],
        },
        {
          heading: "Reading Sensor Data",
          body: "Raw sensor readings are rarely usable straight from the pin — real-world sensors are noisy, and a robot needs to turn a voltage or digital signal into a meaningful number before it can make decisions from it.",
          bullets: [
            "Analog vs. digital signals: many sensors (like a simple IR reflectance sensor) output an analog voltage that must be read through an analog-to-digital converter (ADC); others output clean digital HIGH/LOW signals.",
            "Calibration: taking a few known reference readings (e.g. sensor pointed at black vs. white surface) to translate raw values into meaningful units.",
            "Filtering/smoothing: averaging several readings over time (or using techniques like a moving average) to reduce noise before acting on a value.",
            "Sampling rate: how often you read a sensor matters — reading too infrequently can miss fast-changing events like a sudden collision.",
          ],
        },
        {
          heading: "Putting It Together: A Simple Sense-Act Example",
          body: "Consider a robot with one ultrasonic distance sensor mounted on the front and two DC motors driving its wheels. The control loop reads the distance sensor, and if the reading falls below a threshold (say, 15 cm), it stops the forward motors and reverses briefly before turning. This simple pattern — read sensor, compare to a threshold, decide an action, drive an actuator — is the building block for almost every more sophisticated robot behavior covered later in this course, including full autonomous navigation.",
        },
      ],
      links: [
        { label: "SparkFun — Sensors Overview", url: "https://www.sparkfun.com/" },
        { label: "Arduino Official Documentation", url: "https://docs.arduino.cc/" },
        { label: "NPTEL — Sensors and Actuators", url: "https://nptel.ac.in/" },
      ],
    },
    {
      moduleTitle: "Programming for Robotics",
      sections: [
        {
          heading: "Microcontrollers vs. Single-Board Computers",
          body: "Robotics projects are typically built around one of two kinds of onboard computer, and picking the right one depends on what the robot needs to do:",
          bullets: [
            "Microcontrollers (like the Arduino family) — run one program directly on the hardware with no operating system, very reliable and real-time, ideal for directly reading sensors and driving motors with precise timing, but limited processing power.",
            "Single-board computers / SBCs (like the Raspberry Pi) — run a full operating system (usually Linux), giving access to cameras, networking, and general-purpose programming languages, ideal for higher-level decision-making, vision processing, or Wi-Fi/remote control.",
            "Many real robots use both together: a microcontroller handles the fast, low-level sensor/motor loop, while an SBC handles the slower, higher-level 'thinking' and hands down commands to the microcontroller.",
          ],
        },
        {
          heading: "Programming Microcontrollers (Arduino)",
          body: "Arduino programs (called 'sketches') are written in a simplified C/C++ and always follow the same two-function structure: a setup() function that runs once at power-on to configure pins and initial state, and a loop() function that repeats continuously for as long as the board has power. This structure directly mirrors the sense-think-act cycle: each pass through loop() reads sensors, makes a decision, and updates actuators before repeating.",
          bullets: [
            "pinMode() configures a pin as INPUT (reading a sensor) or OUTPUT (driving an LED, motor driver, etc.).",
            "digitalRead()/digitalWrite() handle simple on/off signals; analogRead()/analogWrite() handle variable voltages (like a potentiometer or motor speed via PWM).",
            "delay() pauses execution for a set time — useful for simple sequencing, but blocks the whole loop, which becomes a problem once a robot needs to do multiple things at once.",
            "millis() returns the time since the board started, and is the standard way to do timing without blocking — checking 'has enough time passed?' instead of pausing execution.",
          ],
        },
        {
          heading: "Programming Single-Board Computers (Raspberry Pi)",
          body: "A Raspberry Pi runs a general-purpose Linux operating system, so robotics code is usually written in Python (or C++) as a normal program rather than a fixed setup/loop sketch. This gives access to full libraries for computer vision, networking, and file storage that a microcontroller can't realistically support, at the cost of less predictable timing — the operating system can briefly delay a program at any point, which matters for tasks needing exact real-time control (better left to a microcontroller working alongside it).",
        },
        {
          heading: "Basic Control Loops",
          body: "A control loop is a repeating cycle that continuously compares a robot's current state to a desired state, and adjusts its actuators to close the gap. The simplest useful version is the on-off (bang-bang) controller: if a sensor reading is above a threshold, do one thing; if below, do another — this is exactly the obstacle-avoidance example from the sensors module.",
          bullets: [
            "Open-loop control: the robot executes a fixed sequence of actions without checking sensor feedback at all (e.g. 'drive forward for 3 seconds'). Simple, but drifts and errors accumulate with nothing correcting them.",
            "Closed-loop control: the robot continuously measures its actual state via sensors and adjusts its actions based on the difference from the target — far more robust to real-world variation like uneven floors or motor differences.",
            "Proportional (P) control: a step up from bang-bang control — instead of a full on/off response, the correction applied is proportional to how far off the current state is from the target, giving smoother, less jerky behavior (e.g. slowing down gradually as a line-following robot approaches the line's edge, rather than snapping hard left or right).",
          ],
        },
        {
          heading: "A Complete Example: Line-Following Robot",
          body: "Bringing together sensors, actuators, and a control loop: a line-following robot uses two IR reflectance sensors mounted at the front, pointed down. In each pass of the control loop, it reads both sensors; if the left sensor detects the line and the right doesn't, it steers right motor faster to correct back toward the line, and vice versa; if both sensors detect the line, it drives both motors evenly forward. This is the same three-part sense-think-act structure introduced in the first module, now expressed as working, repeatable code — the pattern every more advanced robotics project in this course builds on.",
        },
      ],
      links: [
        { label: "Arduino Official Documentation", url: "https://docs.arduino.cc/" },
        { label: "Raspberry Pi Official Documentation", url: "https://www.raspberrypi.com/documentation/" },
        { label: "freeCodeCamp YouTube Channel", url: "https://www.youtube.com/@freecodecamp" },
      ],
    },
  ],
};

export default data;
