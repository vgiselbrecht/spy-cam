
var emailUser;
var idUser;
var stream;
var pc;
var sc;
var canidats = new Array();
var canBlocked = true;
var existSever = false;
var finishedCon = true;

$(document).ready(function () {  
    $.getJSON('ajax.php?f=1', function(result) {
        if (result['status'])
        {
            emailUser = result['content']['email'];
            idUser = result['content']['id'];
            showWorkingPanel();
            hideLoading();
        }
        else
        {
            showLogin();
            hideLoading();
        }
    });
    
});



function showLoading()
{
    $('#Dialog').fadeIn('slow');
}

function hideLoading()
{
    $('#Dialog').fadeOut('slow');
}

function showLogin()
{
    hideAll();
    $('#Login').show();
}

function showWorkingPanel()
{
    hideAll();
    $('#workingPanel').show();
}

function hideAll()
{
    $('#Login').hide();
    $('#workingPanel').hide();
}

function loginSub()
{
    $('#errorEmailLogin').html('');
    $('#errorPasswortLogin').html('');
    var email = $('#emailLogin');
    var password = $('#passwordLogin');
    if(email.val() == '')
    {
        $('#errorEmailLogin').html('Keine Eingabe');      
    } 
    else if (password.val() == '')
    {
        $('#errorPasswortLogin').html('Keine Eingabe');    
    }
    else
    {
        login(email.val(),password.val());
    }
}

function regSub()
{
    $('#errorEmailReg').html('');
    $('#errorPasswortReg').html('');
    var email = $('#emailReg');
    var password = $('#passwordReg');
    var passwordRe = $('#passwordReReg');
    if(email.val() == '')
    {
        $('#errorEmailReg').html('Keine Eingabe');      
    } 
    else if (password.val() == '')
    {
        $('#errorPasswortReg').html('Keine Eingabe');    
    }
    else if (password.val() != passwordRe.val())
    {
        $('#errorPasswortReg').html('Keine übereinstimmung');    
    }
    else if (!email.val().isEmail())
    {
        $('#errorEmailReg').html('Sie habe eine nicht gültige Email Adresse eingegeben!');    
    }
    else if (password.val().length < 8)
    {
        $('#errorPasswortReg').html('Das Passwort benötigt mindestens 8 Zeichen!');    
    }
    else
    {
        showLoading();
        jQuery.ajax({
            url: "ajax.php?f=2",
            type: "POST",
            data: {
                email: email.val(), 
                password: password.val()
            },
            dataType: "json",
            success: function(result) {
                if(result['status'] == 0)
                {
                    $('#errorEmailReg').html('Email bereits vorhanden!'); 
                }
                else
                {
                    login(email.val(),password.val());
                }
                hideLoading();
            }
        });
    }
}

function login(email,passwort)
{
    showLoading();
    jQuery.ajax({
        url: "ajax.php?f=3",
        type: "POST",
        data: {
            email: email, 
            password: passwort
        },
        dataType: "json",
        success: function(result) {
            if(result['status'] == 0)
            {
                $('#errorEmailLogin').html('Falsche Zugangsdaten'); 
            }
            else
            {
                emailUser = result['content']['email'];
                idUser = result['content']['id'];
                showWorkingPanel();
            }
            hideLoading();
        }
    });
}

function logout()
{
    showLoading();
    jQuery.ajax({
        url: "ajax.php?f=4",
        type: "POST",
        dataType: "json",
        success: function(result) {
            //showLogin();
            //hideLoading(); 
            location.href="/";
        }
    });
}

function loginChange(type)
{
    var login = $('#changeElementLogin');
    var reg = $('#changeElementReg');
    if(type == 'login')
    {
        if(reg.hasClass('changeElementAktive'))
        {
            login.addClass('changeElementAktive');
            reg.removeClass('changeElementAktive');
            $('#loginLogin').show();
            $('#loginReg').hide();
        }
    }
    else
    {
        if(login.hasClass('changeElementAktive'))
        {
            reg.addClass('changeElementAktive');
            login.removeClass('changeElementAktive');
            $('#loginLogin').hide();
            $('#loginReg').show();
        }
    }
}

function panelChange(type)
{
    var watch = $('#changeElementWatch');
    var send = $('#changeElementSend');
    if(type == 'Watch')
    {
        if(send.hasClass('changeElementAktive'))
        {
            watch.addClass('changeElementAktive');
            send.removeClass('changeElementAktive');
            $('#Watch').show();
            $('#Send').hide();
        }
    }
    else
    {
        if(watch.hasClass('changeElementAktive'))
        {
            send.addClass('changeElementAktive');
            watch.removeClass('changeElementAktive');
            $('#Watch').hide();
            $('#Send').show();
        }
    }
}

function startWatch(){
    finishedCon = false;
    canBlocked = false;
    existSever = false;
    sc = 'client';
    showLoading();
    var myDataRef = new Firebase('https://gise.firebaseio.com/SpyCam/'+idUser);
    myDataRef.child('on').set(1);
    setTimeout(controlSeverCon, 30000);
    myDataRef.on('child_changed', function(snapshot) {
        if (!finishedCon)
        {
            var userData = snapshot.val();
            if(snapshot.name() == 'on')
            {
                if (userData == 2)
                {
                    existSever = true;
                    createAn(myDataRef);
                }
            }
            else if(snapshot.name() == 'serverIce')
            {
                addIce(userData,false);
            }
        }
    });
}

function startSend(){
    canBlocked = true;
    sc = 'server';
    getUserMedia(mediaConstraints, onUserMediaSuccess,onUserMediaError);
    $('#sendButton').hide();
    var myDataRef = new Firebase('https://gise.firebaseio.com/SpyCam/'+idUser);
    myDataRef.child('on').set(0);
    myDataRef.on('child_changed', function(snapshot) {
        var userData = snapshot.val();
        if(snapshot.name() == 'on')
        {
            if (userData == 1)
            {
                createOffer(myDataRef);
            }
            else if (userData == 3)
            {
                getAnswer(myDataRef);
            }
        }
        else if(snapshot.name() == 'clientIce')
        {
            addIce(userData,false);
        }
    });
}

function addIce(userData,allow)
{
    if(canBlocked || allow)
    {
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: userData.label,
            candidate: userData.candidate
        });
        pc.addIceCandidate(candidate);
        console.log(userData);
    }
    else
    {
        canidats[canidats.length] = userData;
    }
}

function addIceArray()
{
    for(var i = 0; i < canidats.length; i++)
    {
        addIce(canidats[i],true);
    }
}

function createAn(myDataRef)
{
    createPeerConnection();
    jQuery.ajax({
        url: "ajax.php?f=6",
        type: "POST",
        dataType: "json",
        success: function(result) {
            var offer = result['offer'];
            offer = JSON.parse(offer);
            console.log(offer);
            //offer.sdp = addStereo(offer.sdp);
            pc.setRemoteDescription(new RTCSessionDescription(offer), function() {
                addIceArray();
                canBlocked = true;
                pc.createAnswer(function(answer) {
                    console.log(answer);
                    //answer.sdp = preferOpus(answer.sdp);
                    pc.setLocalDescription(answer, function() {
                        jQuery.ajax({
                            url: "ajax.php?f=7",
                            type: "POST",
                            data: {
                                answer: JSON.stringify(answer)
                            },
                            dataType: "json",
                            success: function(result) {
                                myDataRef.child('on').set(3);
                            }
                        });
                    }, function(err) {
                        console.log(err);
                    });        
                }, null,sdpConstraints);
            }, function(err) {
                console.log(err);
            });
        }
    });
}

function createOffer(myDataRef)
{
    createPeerConnection();
    pc.addStream(stream);
    var constraints = mergeConstraints(offerConstraints, sdpConstraints);
    pc.createOffer(function(offer) {
        console.log(offer);
        //offer.sdp = preferOpus(offer.sdp);
        pc.setLocalDescription(offer, function() {
            jQuery.ajax({
                url: "ajax.php?f=5",
                type: "POST",
                data: {
                    offer: JSON.stringify(offer)
                },
                dataType: "json",
                success: function(result) {
                    myDataRef.child('on').set(2);
                }
            });
        }, function(err) {
            console.log(err);
        }); 
    }, null,constraints);
}

function getAnswer(myDataRef)
{
    jQuery.ajax({
        url: "ajax.php?f=8",
        type: "POST",
        dataType: "json",
        success: function(result) {
            var answer = result['answer'];
            answer = JSON.parse(answer);
            console.log(answer);
            //answer.sdp = addStereo(answer.sdp);
            pc.setRemoteDescription(new RTCSessionDescription(answer), function() {
                myDataRef.child('on').set(0);
            }, function(err) {
                console.log(err);
            }); 
        }
    });
}

function createPeerConnection() {
    try {
        // Create an RTCPeerConnection via the polyfill (adapter.js).
        pc = new RTCPeerConnection(pc_config,pcConstraints);
        pc.onicecandidate = onIceCandidate;
        console.log('Created RTCPeerConnnection with:\n' +
            '  config: \'' + JSON.stringify(pc_config) + '\';\n' +
            '  constraints: \'' + JSON.stringify(pcConstraints) + '\'.');
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object; \
            WebRTC is not supported by this browser.');
        return;
    }
    pc.onaddstream = onRemoteStreamAdded;
    pc.onremovestream = onRemoteStreamRemoved;
}

function onIceCandidate(event) {
    if (event.candidate) {
        var myDataRef = new Firebase('https://gise.firebaseio.com/SpyCam/'+idUser);
        var data = {
            label: event.candidate.sdpMLineIndex,  
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        if(sc == 'server')
        {
            myDataRef.child('serverIce').set(data);
        }
        else
        {
            myDataRef.child('clientIce').set(data);    
        }
    } else {
        console.log('End of candidates.');
    }
}

function onRemoteStreamAdded(event) {
    console.log('Remote stream added.');
    $('#Watch').html('<video autoplay="autoplay" id="videoWatch">');
    var videoWatch = document.getElementById("videoWatch");
    attachMediaStream(videoWatch, event.stream);
    finishedCon = true;
    waitUntilRemoteStreamStartsFlowing();
}

function waitUntilRemoteStreamStartsFlowing()
{
    var videoWatch = document.getElementById("videoWatch");
    if (!(videoWatch.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA 
        || videoWatch.paused || videoWatch.currentTime <= 0)) 
        {
        hideLoading();
    } 
    else setTimeout(waitUntilRemoteStreamStartsFlowing, 50);
}

function onRemoteStreamRemoved(event) {
    console.log('Remote stream removed.');
}

var mediaConstraints = {
    audio: false,
    video: true
};

var pc_config = {
    "iceServers": [{
        "url": "stun:stunserver.org"
    }]
};

var offerConstraints = {
    "optional": [], 
    "mandatory": {}
};

var pcConstraints = {
    "optional": [{
        "DtlsSrtpKeyAgreement":true
    }]
};

var sdpConstraints = {
    'mandatory': {
        'OfferToReceiveAudio': false,
        'OfferToReceiveVideo': true
    }
};


function onUserMediaSuccess(estream) {
    console.log('User has granted access to local media.');
    stream = estream;
    var send = 'Webcam wird Aufgenommen!<br><br>';
    send += '<video autoplay="autoplay" id="videoWatchSmall">'
    $('#Send').html(send);
    attachMediaStream(videoWatchSmall, stream);
}

function onUserMediaError(error) {
    console.log('Failed to get access to local media. Error code was ' +
        error.code);
    alert('Auf ihre Webcam kann im moment nicht zugegriffen werden!');
}

// Set Opus as the default audio codec if it's present.
function preferOpus(sdp) {
    var sdpLines = sdp.split('\r\n');

    // Search for m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('m=audio') !== -1) {
            var mLineIndex = i;
            break;
        }
    }
    if (mLineIndex === null)
        return sdp;

    // If Opus is available, set it as the default in m line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            if (opusPayload)
                sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex],
                    opusPayload);
            break;
        }
    }

    // Remove CN in m line and sdp.
    sdpLines = removeCN(sdpLines, mLineIndex);

    sdp = sdpLines.join('\r\n');
    return sdp;
}

// Set Opus in stereo if stereo is enabled.
function addStereo(sdp) {
    var sdpLines = sdp.split('\r\n');

    // Find opus payload.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('opus/48000') !== -1) {
            var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
            break;
        }
    }
    
    var fmtpLineIndex = -1;

    // Find the payload in fmtp line.
    for (var i = 0; i < sdpLines.length; i++) {
        if (sdpLines[i].search('a=fmtp') !== -1) {
            var payload = extractSdp(sdpLines[i], /a=fmtp:(\d+)/ );
            if (payload === opusPayload) {
                var fmtpLineIndex = i;
                break;
            }
        }
    }
    // No fmtp line found.
    if (fmtpLineIndex == -1)
    {
        return sdp;
    }

    // Append stereo=1 to fmtp line.
    sdpLines[fmtpLineIndex] = sdpLines[fmtpLineIndex].concat(' stereo=1');

    sdp = sdpLines.join('\r\n');
    return sdp;
}

// Strip CN from sdp before CN constraints is ready.
function removeCN(sdpLines, mLineIndex) {
    if(mLineIndex !== undefined)
    {
        var mLineElements = sdpLines[mLineIndex].split(' ');
        // Scan from end for the convenience of removing an item.
        for (var i = sdpLines.length-1; i >= 0; i--) {
            var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
            if (payload) {
                var cnPos = mLineElements.indexOf(payload);
                if (cnPos !== -1) {
                    // Remove CN payload from m line.
                    mLineElements.splice(cnPos, 1);
                }
                // Remove CN line in sdp
                sdpLines.splice(i, 1);
            }
        }

        sdpLines[mLineIndex] = mLineElements.join(' ');
    }
    return sdpLines;
}               

function extractSdp(sdpLine, pattern) {
    var result = sdpLine.match(pattern);
    return (result && result.length == 2)? result[1]: null;
}

String.prototype.isEmail = function () {
    var validmailregex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z][a-z]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
    return validmailregex.test(this);
}

function controlSeverCon()
{
    if (!existSever)
    {
        var old = $('#Watch').html();
        $('#Watch').html('Kein Sender wurde gefunden<br><br>'+old);
        var myDataRef = new Firebase('https://gise.firebaseio.com/SpyCam/'+idUser);
        myDataRef.child('on').set(0);
        hideLoading();
        finishedCon = true;
    }
}

function mergeConstraints(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
        merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
}