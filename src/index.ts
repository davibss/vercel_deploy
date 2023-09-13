import express, { Request, Response } from 'express';
// @ts-ignore
import generator from "@asyncapi/generator";

const app = express();
const port = process.env.PORT || 8080;

const spec = `
asyncapi: 2.6.0
id: 'urn:example:es:us:edscorbot:mqtt-server'

info:
  title: ES Scorbot Async API
  version: 1.0.0
  description: >
    The ED Scorbot low level services definition for controlling an watching
    values from the Robotic arm. 


    ### Some useful links:

    * [Ed Scorbot Python]
    (https://github.com/RTC-research-group/Py-EDScorbotTool) - the Github
    projectcontaining the library (real implementation) of elementary/low level
    functions to access the robotic arm

    * [Ed Scorbot Documentation]
    (https://py-edscorbottool.readthedocs.io/en/latest/) - the user
    documentation/guide of the ED Scorbot tools (GUI, command line and detailed
    configurations). 

    ### Symbology

    * CONTROLLER = Arm's controller. The service responsible for receiving messages from clients, handling the physical arm and notifying clients. The controller guarantees the arm works accodring with its requirements.

    * CLIENT = Any application that wants to interact with the arm. In our case, this application is an Angular front-end to provide a friendly user experience to the final user (human).

    * We use a style where the information flows in channels from providers to subscribers.

    ### Communication Design

    The implemented controller follows a design in which topics are minimize. Tha is, a single topic is used to send information between providers and consumers in two directions. This reduces the mumber of channels/topics, but increases the implementation complexity in applications as they should communicate in a topic and handle the callback in the same topic. 


    Furthermore, to provide the possibility of connecting many controllers to a same broker, we include the 'Robot Name' as prefix of the channel/topic. For example, let us adopt 'EDScorbot' as the robot's name from now on. We adopt the channel 'metainfo' as a meta channel on which controllers can publish information about themsalves, such as name of the arm and information about joints (maximum angle, minimum angle, number of joints, etc.). 

    #### Metainfo 

    The requests and the answers concerned with metainfo are encapsulated in the payload of the message (communicated through channel 'metainfo'). We distinguish which function or signal is sent/received using integers with the following semantics:

      * 'ARM_GET_METAINFO' (value 1) - provided to clients to use to request the metainfo about all arms connected to the broker. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_METAINFO' (value 2) - provided to CONTROLLERS inform the metainfo of their associated physical arms. CONTROLLERS (publishers) sends this data to the CLIENTS (subscribers)


      #### Functions 

      The functions and the answers exchanged between clients and the controller are encapsulated in the payload of the message (communicate through channel 'EDScorbot/commands'). We distinguish which function or signal is sent/received using integers wose semantics is as follows:

      * 'ARM_CHECK_STATUS' (value 3) - provided to CLIENTS use to check the status of the arm. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_STATUS' (value 4) - provided to the CONTROLLER inform the current status of the arm. CONTROLLER (publisher) sends this data to the CLIENTS (subscribers)

     * 'ARM_CONNECT' (value 5) - provided to CLIENTS use to connect to the arm, so they can become owners. If the arm is available, the controller promotes on client to 'owner' and notifies all clients about it. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_CONNECTED' (value 6) - provided to the CONTROLLER inform which client has successfully connected to the arm and became its 'owner'. Only one client can be the amr's owner at a time. By the message content, client are able to know if they have been rejected as owner. CONTROLLER (publisher) sends this data to the CLIENTS (subscribers)
        
      * 'ARM_MOVE_TO_POINT' (value 7) - provided to allow the owner to move the arm in a point by point interaction. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)


      * 'ARM_APPLY_TRAJECTORY' (value 8) - provided to allow arm's owner to send a trajectory to the controller. A trajectory is a sequence of points and its execution respects the order of the points. Each point represents a single movement to be executed by the robot. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_CANCEL_TRAJECTORY' (value 9) - provided to allow arm's owner to cancel a trajectory execution at any time. The arm stops in the last point and communicates it. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_CANCELED_TRAJECTORY' (value 10) - provided to allow arm's owner to cancel a trajectory execution at any time. The arm stops in the last point and communicates it. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_DISCONNECT' (value 11) - provided to allow arm's owner (CLIENT) to 'release' the arm. CLIENTS (publishers) send this function request to the CONTROLLER (subscriber)

      * 'ARM_DISCONNECTED' (value 12) - provided to allow the CONTROLLER inform that the owner has disconnected and the arm is available. CONTROLLER (publisher) sends this data to the CLIENTS (subscribers)

      * 'ARM_HOME_SEARCHED' (value 13) - provided to allow the CONTROLLER inform that the arm has been moved to home position. This is necessary because when a user connects to the arm, the CONTROLLER must move it to home by using the procedure 'search_home' which might take about 2 min at most. While the arm is searching its home position, no other operation is allowed. CONTROLLER (publisher) sends this data to the CLIENTS (subscribers)

  termsOfService: https://asyncapi.org/terms/
  contact:
    name: Enrique Piñero Fuentes
    url: https://www.asyncapi.org/support
    email: epinerof@us.es
  license:
    name: Apache 2.0
    url: 'https://www.apache.org/licenses/LICENSE-2.0'
  
servers:
  mosquitto:
    url: host.to.be.defined
    protocol: secure-mqtt
    description: Mosquitto test broker hosted at University of Sevilla
    #security:
    #  - user-password: []

defaultContentType: application/json

#tags:
#  - name: connection
#    description: Connection/Disconnection actions to be executed and their related topics
  
channels:
  'metainfo':
    description: Channel/topic provided to allow communication of metainfos. This channel plays the role of a "meta" channel where multiple CONTROLLERS can publish information about themselves and CLIENTS can obtain information about them at once.  We use a design in which different CONTROLLERS can be registered in the broker. Thus, they respond this message and CLIENTS can choose which arm to interact with. This design makes possible to connect a same client application with different arms.   
    publish:
      summary: CLIENTS and CONTROLLERS are publishers
      operationId: metainfoPub
      message:
        payload:
          $ref: '#/components/schemas/MetaInfoObject'

    subscribe:
      summary: CLIENTS and CONTROLLERS are subscribers
      operationId: metainfoSub
      message:
        payload:
          $ref: '#/components/schemas/MetaInfoObject'
     
  'EDScorbot/commands':
    description: Channel/topic provided to allow interactions between CLIENTS and CONTROLLERS, so that commands can be sent to the arm and suitable answers can be returned to CLIENTS.  
    publish:
      summary: CLIENTS and CONTROLLERS are publishers
      operationId: commandsPub
      message:
        payload:
          $ref: '#/components/schemas/CommandObject'
    subscribe:
      summary: CLIENTS and CONTROLLERS are publishers 
      operationId: commandsSub
      message:
        payload:
          $ref: '#/components/schemas/CommandObject'   
  
  'EDScorbot/moved':
    description: Channel/topic provided to allow the CONTROLLER to publish the last point of the arm. The controller is supposed to publish this point each time the arm is moved. Therefore, it does not matter if the controller has moved the arm to the home position of is executing an entire trajectory.  
    publish:
      summary: CONTROLLER is publisher
      operationId: movedPub
      message:
        payload:
          $ref: '#/components/schemas/MovedObject'
    subscribe:
      summary: CLIENTS are subscribers
      operationId: movedSub
      message:
        payload:
          $ref: '#/components/schemas/MovedObject'
  
components:
  schemas:
    Client:
      type: object
      description: A client of the arm. It represents an user that wants to interact with the arm. It encapsulates all relevant information about the arm's client.
      properties:
        id:
          type: string
          description: The client identifier (email, token, etc.)
    
    Joint:
      type: integer
      description: The reference value (angle) of a joint.

    Point:
      type: array
      description: A tuple (set of coordinates) containing (possibly many) information about the angles of the joints and one information (the last coordinate) meaning the time to wait before accepting the next move command. The representation of a point as an array allows many robots to be handled as there is no fixed number of joints. This is formation should be obtained bu clients before connecting to a specific arm. 
      items:
        $ref: '#/components/schemas/Joint'
    
    Trajectory:
      type: array
      description: A array of points to be applied to the arm.
      items:
        $ref: '#/components/schemas/Point'
          
    ErrorState:
      type: boolean
      description: A flag representing that the controller is in an internal error state probably due to some problem with the physical arm. 

    CommandSignal:
      type: integer
      description: The function/answer involved in the 'commands' topic.  
      enum:
        - ARM_CHECK_STATUS = 3
        - ARM_STATUS = 4
        - ARM_CONNECT = 5
        - ARM_CONNECTED = 6
        - ARM_MOVE_TO_POINT = 7
        - ARM_APPLY_TRAJECTORY = 8
        - ARM_CANCEL_TRAJECTORY = 9
        - ARM_CANCELED_TRAJECTORY = 10 
        - ARM_DISCONNECT = 11
        - ARM_DISCONNECTED = 12
        - ARM_HOME_SEARCHED = 13

    MetaInfoSignal:
      type: integer
      description: a signal indicating if is a request (ARM_GET_METAINFO) or a response (ARM_METAINFO)
      enum:
        - ARM_GET_METAINFO = 1
        - ARM_METAINFO = 2

    MetaInfoObject:
      type: object
      description: The metainfo about the robot. For the moment we use only the name and the number of joints of the robot. Each joint has a range between a minimum and a maximum values to be informed in the metainfo. The metainfo containz exactly the number of joints in the robot
      required:
        - signal
      properties:
        signal:
          $ref: '#/components/schemas/MetaInfoSignal'
        name:
          type: string
          description: The name of the robot
        joints:
          type: array
          description: The information about each joint of the robot
          items:
            $ref: '#/components/schemas/JointInfo'

    JointInfo:
      type: object
      description: Meta information about a joint. It contains the minimum and the maximum angles of the joint.
      properties:
        minimum:
          type: integer
        maximum:
          type: integer

    CommandObject:
      type: object
      description: The object involved in the interaction with the arm. It contains all the information necessary to be exchanged between CLIENTS and CONTROLLERS for all functions to be invoked. Depending on the invoked function or answer the payload content changes. 
      required:
        - signal
      properties:
        signal:
          $ref: '#/components/schemas/CommandSignal'
        client:
          $ref: '#/components/schemas/Client'
        error:
          $ref: '#/components/schemas/ErrorState'
        point:
          $ref: '#/components/schemas/Point'
        trajectory:
          $ref: '#/components/schemas/Trajectory'
    MovedObject:
      type: object
      description: The object to be communicated though channel 'moved'. It contains one point, the error state and the client (owner)
      properties:
        client:
          $ref: '#/components/schemas/Client'
        error:
          $ref: '#/components/schemas/ErrorState'
        content:
          $ref: '#/components/schemas/Point'

  securitySchemes:
      user-password:
        type: userPassword
`;

app.get('/', async (_req: Request, res: Response) => {
    return res.send('Express Typescript on Vercel');
});

app.get('/ping', async (_req: Request, res: Response) => {
    const generatorInstance = new generator(
        "./node_modules/cpp-template", 
        "/home/davibss/.client_generator_tmp/output", 
        {
            forceWrite: true
        }
    );
    await generatorInstance.generateFromString(spec);
    return res.send('pong 🏓');
});

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});