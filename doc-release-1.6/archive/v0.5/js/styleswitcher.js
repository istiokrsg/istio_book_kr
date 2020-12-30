"use strict"function applyStyleSheet(title) {    var i, a;    for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {        if (a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")) {            a.disabled = true;            if (a.getAttribute("title") == title) {                a.disabled = false;            }        }    }    // set theme-XXX class on the body element    var b = document.getElementsByTagName("body")[0]    if (b != undefined) {        var c = b.getAttribute("class")        var s = c.split(" ")        for (i = 0; i < s.length; i++) {            if (s[i].startsWith("theme-")) {                s[i] = "theme-" + title            }        }        b.setAttribute("class", s.join(" "))    }}function getPreferredStyleSheet() {    var i, a;    for (i = 0; (a = document.getElementsByTagName("link")[i]); i++) {        if (a.getAttribute("rel").indexOf("style") != -1            && a.getAttribute("rel").indexOf("alt") == -1            && a.getAttribute("title")        ) {            return a.getAttribute("title");        }    }    return null;}function createCookie(name, value, days) {    if (days) {        var date = new Date();        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));        var expires = "; expires=" + date.toGMTString();    }    else {        expires = "";    }    document.cookie = name + "=" + value + expires + "; path=/";}function readCookie(name) {    var nameEQ = name + "=";    var ca = document.cookie.split(';');    for (var i = 0; i < ca.length; i++) {        var c = ca[i];        while (c.charAt(0) == ' ') {            c = c.substring(1, c.length);        }        if (c.indexOf(nameEQ) == 0) {            return c.substring(nameEQ.length, c.length);        }    }    return undefined;}function setActiveStyleSheet(title) {    applyStyleSheet(title)    createCookie("style", title);}function loadActiveStyleSheet() {    var cookie = readCookie("style");    if (cookie == undefined) {        applyStyleSheet(getPreferredStyleSheet());    } else {        applyStyleSheet(cookie);    }}window.onload = function (e) {    loadActiveStyleSheet()}loadActiveStyleSheet()