const APP_ID = "38f99d48b8054706bb4ba6d7c03845ae"
const TOKEN = "007eJxTYJgc3eCkt/jYr7XGmof/Tpn4LjEquZnxtPvnllpl69ifx7kVGIwt0iwtU0wskiwMTE3MDcySkkySEs1SzJMNjC1MTBNT5c6eSm4IZGSYyVvHysgAgSA+C0NuYmYeAwMAe8Mfug=="
const CHANNEL = "main"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

<<<<<<< HEAD
let joinAndDisplayLocalStream = async () => {
=======
if (authUsers.includes(uid)) {
    console.log(uid);
}


const servers = {
    iceServers: [
        {
            urls: ['stun:stun.services.mozilla.com','stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302','stun:stun3.l.google.com:19302','stun:stun4.l.google.com:19302']
        }
    ]
}


let constraints = {
    video: {
        width: 640,
        height:480
    },
    audio: true
}


let init = async () => {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({ uid, token })
    console.log("CLIENT------>", client);

    channel = client.createChannel(roomId)
    await channel.join()

    channel.on('MemberJoined', async (MemberId) => {
        console.log('A new user joined the channel:', MemberId)
        await createPeerConnection(MemberId)

        let offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)

        client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId)
    })


    channel.on('MemberLeft', (MemberId) => {
        console.log("Member Left : ", MemberId)
        document.getElementById('user2').style.display = 'none'
        document.getElementById('user1').classList.remove('smallFrame')
    })



    client.on('MessageFromPeer', async (message, MemberId) => {

        message = JSON.parse(message.text)
        console.log("MESSEGE ----->",message);
        if (message.type === 'offer') {
            await createPeerConnection(MemberId)
            await peerConnection.setRemoteDescription(message.offer)
            let answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId)
        }

        if (message.type === 'answer') {
            if (!peerConnection.currentRemoteDescription) {
                peerConnection.setRemoteDescription(message.answer)
            }
        }

        if (message.type === 'candidate') {
            if (peerConnection) {
                console.log("IN PEER MESSAGE------->",peerConnection);
                // if (peerConnection.currentRemoteDescription) {
                    peerConnection.addIceCandidate(message.candidate)
                // }
            }
        }


    })

    localStream = await navigator.mediaDevices.getUserMedia(constraints);
    audioTrack = localStream.getTracks().find(track => track.kind === 'audio')
    document.getElementById('user1').srcObject = localStream;

}


let createPeerConnection = async (MemberId) => {

    peerConnection = new RTCPeerConnection(servers)
    console.log("PEER CONNECTION------>", peerConnection);
    remoteStream = new MediaStream()
    document.getElementById('user2').srcObject = remoteStream
    document.getElementById('user2').style.display = 'block'

    document.getElementById('user1').classList.add('smallFrame')


    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        document.getElementById('user1').srcObject = localStream
    }

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
    })

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate && peerConnection.currentRemoteDescription!=null) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)
        }
    }
}



let leaveChannel = async () => {
    await channel.leave()
    await client.logout()
}

let toggleCamera = async () => {
    let videoTrack = localStream.getTracks().find(track => track.kind === 'video')
    console.log("Video TRACK", videoTrack)
    if (videoTrack.enabled) {
        videoTrack.enabled = false
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        videoTrack.enabled = true
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

let toggleMic = async () => {
>>>>>>> b850d7cb1867958056b3b9cc878b9be84b61f767

    client.on('user-published', handleUserJoined)
    
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

<<<<<<< HEAD
let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
=======
init()
>>>>>>> b850d7cb1867958056b3b9cc878b9be84b61f767
