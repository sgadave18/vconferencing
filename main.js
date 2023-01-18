const APP_ID = "38f99d48b8054706bb4ba6d7c03845ae"

let authUsers = ['Swapnil', 'Swappy']
let token = null;
let client;
let channel;
let queryString = window.location.search
let urlParams = new URLSearchParams(queryString)
let roomId = urlParams.get('room')
let uid = urlParams.get('uid')
let localStream;
let remoteStream;
let peerConnection;

if (!roomId) {
    window.location = 'index.html'
    window.location = 'index.html'
}

if (authUsers.includes(uid)) {
    console.log(uid);
}


const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
}


let constraints = {
    video: {
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
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

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    document.getElementById('user1').srcObject = localStream
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

    let audioTrack = localStream.getTracks().find(track => track.kind === 'audio')
    console.log("AUDIO TRACK", audioTrack)
    if (audioTrack.enabled) {
        audioTrack.enabled = false
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(255, 80, 80)'
    } else {
        audioTrack.enabled = true
        document.getElementById('mic-btn').style.backgroundColor = 'rgb(179, 102, 249, .9)'
    }
}

window.addEventListener('beforeunload', leaveChannel)

init()