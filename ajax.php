<?php
session_start();
header("Content-Type: text/html; charset=utf-8");
include_once 'mysql.php';

if (isset($_GET['f'])) {
    //Verbindung zur Datenbank
    connection();

    //Start Info
    if ($_GET['f'] == 1) {
        $login = false;
        if (isset($_SESSION['status'])) {
            if ($_SESSION['status']) {
                $login = true;
            }
        }
        $email = '';
        $id = '';
        if (isset($_SESSION['mail'])) {
            $email = $_SESSION['mail'];
        }
        if (isset($_SESSION['num'])) {
            $id = $_SESSION['num'];
        }

        echo json_encode(array('status' => $login, 'content' => array('email' => $email, 'id' => $id)));
    }
    //Regi
    else if ($_GET['f'] == 2) {
        if (isset($_POST['email']) AND isset($_POST['password'])) {
            $email = addslashes(strtolower($_POST['email']));
            $password = addslashes($_POST['password']);
            echo reg($email, $password);
        }
    }
    //Login
    else if ($_GET['f'] == 3) {
        if (isset($_POST['email']) AND isset($_POST['password'])) {
            $email = addslashes(strtolower($_POST['email']));
            $password = addslashes($_POST['password']);
            echo login($email, $password);
        }
    }
    //Logout
    else if ($_GET['f'] == 4) {
        $_SESSION['status'] = false;
        $_SESSION['mail'] = '';
        $_SESSION['num'] = '';
        echo '1';
    }
    //SaveOffer
    else if ($_GET['f'] == 5) {
        if ($_SESSION['status'] AND isset($_POST['offer'])) {
            $offer = $_REQUEST['offer'];
            saveOffer($offer);
            echo '1';
        }
    }
    //GetOffer
    else if ($_GET['f'] == 6) {
        if ($_SESSION['status']) {
            echo getOffer();
        }
    }
    //SaveAnswer
    else if ($_GET['f'] == 7) {
        if ($_SESSION['status'] AND isset($_POST['answer'])) {
            $answer = $_REQUEST['answer'];
            saveAnswer($answer);
            echo '1';
        }
    }
    //GetAnswer
    else if ($_GET['f'] == 8) {
        if ($_SESSION['status']) {
            echo getAnswer();
        }
    }
}

function reg($email, $password) {
    $cor = 0;
    $result = mysql_result(mysql_query("SELECT count(*) FROM users WHERE email = '" . $email . "'"), 0);
    if ($result < 1) {
        mysql_query("INSERT INTO users (email,password) VALUES ('" . $email . "','" . md5($password) . "')") or die(mysql_error());
        $cor = 1;
    }
    return json_encode(array('status' => $cor, 'content' => array('email' => $email)));
}

function login($email, $password) {
    $cor = 0;
    $result = mysql_query("SELECT id FROM users WHERE email = '" . $email . "' AND password like '" . md5($password) . "'");
    $id = '';
    while ($row = mysql_fetch_array($result)) {
        $cor = 1;
        $_SESSION['status'] = true;
        $_SESSION['mail'] = $email;
        $id = $_SESSION['num'] = $row['id'];
        break;
    }
    return json_encode(array('status' => $cor, 'content' => array('email' => $email, 'id' => $id)));
}

function saveOffer($offer) {
    $offer = str_replace("\\r\\", "$&", $offer);
    mysql_query("UPDATE users SET offer = '" . $offer . "' WHERE email = '" . $_SESSION['mail'] . "'") or die(mysql_error());
}

function getOffer() {
    $result = mysql_query("SELECT offer FROM users WHERE email = '" . $_SESSION['mail'] . "'") or die(mysql_error());
    while ($row = mysql_fetch_array($result)) {
        return json_encode(array('offer' => str_replace("$&", "\\r\\", $row['offer'])));
    }
}

function saveAnswer($answer) {
    $answer = str_replace("\\r\\", "$&", $answer);
    mysql_query("UPDATE users SET answer = '" . $answer . "' WHERE email = '" . $_SESSION['mail'] . "'") or die(mysql_error());
}

function getAnswer() {
    $result = mysql_query("SELECT answer FROM users WHERE email = '" . $_SESSION['mail'] . "'") or die(mysql_error());
    while ($row = mysql_fetch_array($result)) {
        return json_encode(array('answer' => str_replace("$&", "\\r\\", $row['answer'])));
    }
}

?>
