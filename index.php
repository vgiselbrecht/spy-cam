<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>SpyCam - The Browser IP Cam</title>
        <meta name="description" content="Mit diesem einzigartigen Tool können Sie über ihren Browser die Webcam eines Computers oder Smartphones als Überwachungskamera nutzen.">
        <meta name="keywords" content="WebRTC, SpyCam, Free, Valentin Giselbrecht, gise, Überwachung, Browser, webcam, ip cam">
        <meta name="author" content="Valentin Giselbrecht">
        <meta property="og:title" content="SpyCam - The Browser IP Cam" />
        <meta property="og:description" content="Mit diesem einzigartigen Tool können Sie über ihren Browser die Webcam eines Computers oder Smartphones als Überwachungskamera nutzen." />
        <meta property="og:url" content="http://spy.gise.at/" />
        <meta property="og:image" content="http://spy.gise.at/images/spycam.png" />
        <meta content='True' name='HandheldFriendly' />
        <meta name="viewport" content="width=430" />  
        <link rel="shortcut icon" type="image/x-icon" href="images/favicon.ico" />
        <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
        <link media="screen and (min-width: 700px)" rel="stylesheet" href="style.css" type="text/css"/>
        <link media="screen and (max-width: 699px)" rel="stylesheet" href="mobile.css" type="text/css"/>
        <script src='https://cdn.firebase.com/v0/firebase.js'></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script> 
        <script type="text/javascript" src="./adapter.js"></script> 
        <script type="text/javascript" src="./script.js"></script> 
    </head>
    <body>
        <header>
            <ul class="headerTextReihe">
                <li class="headerText headerTextSmall"><a target="_blank" href="http://www.gise.at">Entwickler</a></li>
                <li class="headerText headerTextLarge">SpyCam</li>
                <li class="headerText headerTextSmall"><a target="_blank"  href="http://www.gise.at/de/impressum.html">Impressum</a></li>
            </ul>
        </header>
        <div id="content">
            <div id="Login" class="NonVis">
                <div id="loginMenu" class="changer">
                    <div id="changeElementLogin" onclick="loginChange('login')" class="changerElement changerElementLeft changeElementAktive">Login</div>
                    <div id="changeElementReg"  onclick="loginChange('reg')" class="changerElement changerElementRight changeElementNone">Registrieren</div>
                </div>
                <div id="loginLogin">
                    <h2>Login</h2>
                    <form onsubmit="return false;">
                        <table cellpadding="5" cellspacing="0" class="tl_login_table" summary="Input fields">
                            <tr>
                                <td width="120px"><label class="labels" for="username">Email:</label></td>
                                <td><input class="inputs" id="emailLogin" type="text" name="username" style="width: 140px;" /></td>
                                <td id="errorEmailLogin" class="errorMessage"></td>
                            </tr>
                            <tr>
                                <td><label class="labels" for="password">Passwort:</label></td>
                                <td><input class="inputs" onkeydown="if (event.keyCode == 13) { loginSub(); return false; }" id="passwordLogin" type="password" name="password" style="width: 140px;" /></td>
                                <td id="errorPasswortLogin" class="errorMessage"></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><input class="button" onclick="loginSub()" type="submit" value="Login"></td>
                            </tr>
                        </table>
                    </form>
                </div>
                <div id="loginReg" class="NonVis">
                    <h2>Registrieren</h2>
                    <table cellpadding="5" cellspacing="0" class="tl_login_table" summary="Input fields">
                        <tr>
                            <td width="120px"><label class="labels" for="username">Email:</label></td>
                            <td ><input class="inputs" id="emailReg" type="text" name="username" style="width: 140px;" /></td>
                            <td id="errorEmailReg" class="errorMessage"></td>
                        </tr>
                        <tr>
                            <td><label class="labels" for="password">Passwort:</label></td>
                            <td><input class="inputs" id="passwordReg" type="password" name="password" style="width: 140px;" /></td>
                            <td id="errorPasswortReg" class="errorMessage"></td>
                        </tr>
                        <tr>
                            <td><label class="labels" for="password">Passwort Wiederholen:</label></td>
                            <td><input class="inputs" onkeydown="if (event.keyCode == 13) { regSub(); return false; }" id="passwordReReg"  type="password" name="password" style="width: 140px;" /></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input class="button" onclick="regSub()" type="submit" value="Registrieren"></td>
                        </tr>
                    </table>
                </div>
            </div>
            <div id="workingPanel" class="NonVis">
                <div id="loginMenu" class="changer">
                    <div id="changeElementWatch" onclick="panelChange('Watch')" class="changerElement changerElementLeft changeElementAktive">Sehen</div>
                    <div id="changeElementSend"  onclick="panelChange('Send')" class="changerElement changerElementRight changeElementNone">Senden</div>
                </div>
                <div id="Watch">
                    <div onclick="startWatch()" style="width:200px" class="button">Verbindung aufbauen</div>
                </div>
                <div id="Send" class="NonVis">
                    <div id="sendButton" onclick="startSend()" style="width:200px" class="button">Webcam Freigeben</div>
                </div>
                <div id="panelFoot">
                    <div onclick="logout()" class="link">Logout</div>
                </div>
            </div>
            <div id="Dialog">
                <div id="DialogBackground"></div>
                <div id="DialogFront">
                    <img src="images/loader.gif" class="loading" alt="loading"/>
                    <div class="loadingText">
                        Daten werder geladen...
                    </div>
                </div>
            </div>
        </div>
        <footer>

        </footer>
        <script>
            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-42918844-1', 'gise.at');
            ga('send', 'pageview');

        </script>
    </body>
</html>