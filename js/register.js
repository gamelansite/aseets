$(function() {
    const popupCenter = ({url,title,w,h}) => {
        const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
        const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
        const systemZoom = width / window.screen.availWidth;
        const left = (width - w) / 2 / systemZoom + dualScreenLeft;
        const top = (height - h) / 2 / systemZoom + dualScreenTop;
        const newWindow = window.open(url, title, `
            scrollbars=yes,
            width=${w/systemZoom},
            height=${h/systemZoom},
            top=${top},
            left=${left}
            `);
        if (window.focus) newWindow.focus();
    };
    var zean_name = getParameterByName("zean");
    if (zean_name != undefined && zean_name != null) {
        let zean_nameEsc = escape(zean_name);
        setCookie("zean", zean_nameEsc, 1440);
    }
    var zean_name = getCookie("zean");
    $(document).ready(function() {
        let toggle_submit = false;
        $("#register-btn-submit").click(function() {
            let newUser = {};
            if (!toggle_submit) {
                toggle_submit = true;
                let validate_item = $(".use-validate-sys");
                for (let i = 0; i < validate_item.length; i++) {
                    let item = validate_item[i];
                    let value = $(item).val().replace(/\s+/g, "");
                    let result_check = true;
                    if (result_check == false) {
                        Swal.fire({
                            title: "ผิดพลาด!",
                            icon: "warning",
                            html: `<p style="font-size:18px">${result_check.msg}</p>`,
                            onOpen: () => {
                                $(".swal2-header span").css("font-size", "1rem");
                            },
                        });
                        $(item).focus();
                        toggle_submit = false;
                        return;
                    }
                    newUser[$(item).attr("name")] = value;
                }
                var zean_name = getCookie("zean");
                var currentPath = getCookieUrl("current_url");
                var referPath = getCookieUrl("referrer_url");
                var firstPath = getCookieUrl("first_referrer");
                if (zean_name == false) {
                    newUser.from = "google";
                } else {
                    newUser.from = zean_name;
                }
                var current_noCookie = decodeURIComponent(window.location.href);
                if (current_noCookie == referPath) {
                    referPath = currentPath;
                }
                newUser.current_url = current_noCookie;
                newUser.referrer_url = referPath;
                try {
                    if (referPath.includes("?zean=")) {
                        var new_zean = referPath.split("?zean=")[1].split("&")[0];
                        newUser.from = new_zean;
                    } else if (current_noCookie.includes("?zean=")) {
                        var new_zean = current_noCookie.split("?zean=")[1].split("&")[0];
                        newUser.from = new_zean;
                    }
                } catch (e) {
                    console.log(e);
                    console.log("set new invite failed..");
                }
                if (firstPath == "do-nothing") {
                    firstPath = "";
                }
                newUser.first_referrer = firstPath;
                Swal.fire({
                    icon: "info",
                    title: "กรุณารอสักครู่",
                    html: "กำลังตรวจสอบข้อมูล..",
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                        Swal.showLoading();
                    },
                });
                $.post(system_url + "/register", newUser, function(resp) {
                    swal.close();
                    if (resp.status == false) {
                        Swal.fire({
                            title: "ไม่สำเร็จ!",
                            icon: "error",
                            html: `<p style="font-size:18px">${resp.msg}</p>`,
                            onOpen: () => {
                                $(".swal2-header span").css("font-size", "1rem");
                            },
                        });
                    } else {
                        Swal.fire({
                            title: "สมัครสมาชิกสำเร็จ!",
                            icon: "success",
                            html: `<p style="font-size:18px">ผู้ใช้ : ${resp.msg}<br>รหัสผ่าน : ${newUser.password.replace('@Zz1','')}</p>`,
                            showCloseButton: false,
                            showCancelButton: false,
                            focusConfirm: true,
                            confirmButtonText: '<i class="fa fa-thumbs-up"></i> ตกลง!',
                            onOpen: () => {
                                $(".swal2-header span").css("font-size", "1rem");
                            },
                        }).then(function() {
                            let newData = {};
                            newData.tel = resp.msg;
                            newData.password = newUser.password;
                            $.post(system_url + "/login", newData, function(resp2) {
                                if (resp2.status == false) {
                                    Swal.fire({
                                        title: "เข้าสู่ระบบไม่สำเร็จ!",
                                        icon: "error",
                                        html: `<p style="font-size:18px">${resp2.msg}</p>`,
                                        onOpen: () => {
                                            $(".swal2-header span").css("font-size", "1rem");
                                        },
                                    });
                                } else {
                                    var extra_query = $.param(crm_setting);
                                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                                        (window.location.href = system_url +
                                            "/chklogin?data=" +
                                            resp2.msg +
                                            "&" +
                                            extra_query), title;
                                    } else {
                                        popupCenter({
                                            url: system_url +
                                                "/chklogin?data=" +
                                                resp2.msg +
                                                "&" +
                                                extra_query,
                                            title: "",
                                            w: 500,
                                            h: 800,
                                        });
                                    }
                                    location.reload();
                                }
                            });
                        });
                    }
                    toggle_submit = false;
                });
            }
        });
    });
});

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setCookie(cname, cvalue, min) {
    var d = new Date();
    d.setTime(d.getTime() + min * 60 * 1000);
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(unescape(document.cookie));
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return false;
}
var current_url = decodeURIComponent(window.location.href);
var referrer_url = decodeURIComponent(document.referrer);
var first_referrer = decodeURIComponent(document.referrer);
var url_website = window.location.href.split(".");
url_website = url_website[0].split("/");
url_website = url_website[2];
if (first_referrer.includes(url_website)) {
    first_referrer = "do-nothing";
}
checkCookieUrl(current_url, referrer_url, first_referrer, url_website);

function setCookieUrl(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookieUrl(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(unescape(document.cookie));
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    if (cname == "first_referrer") {
        return "do-nothing";
    } else {
        return "";
    }
}

function checkCookieUrl(current_url, referrer_url, first_referrer, url_website) {
    if (referrer_url == current_url) {
        setCookieUrl("current_url", escape(current_url), 30);
    } else {
        setCookieUrl("current_url", escape(current_url), 30);
        setCookieUrl("referrer_url", escape(referrer_url), 30);
    }
    var cur_url = getCookieUrl("current_url");
    var refer_url = getCookieUrl("referrer_url");
    var first_refer = getCookieUrl("first_referrer");
    if (first_refer != "") {
        if (!refer_url.includes(escape(url_website))) {
            setCookieUrl("first_referrer", escape(refer_url), 30);
            first_refer = getCookieUrl("first_referrer");
        }
    } else {
        if (first_referrer == "do-nothing") {
            setCookieUrl("first_referrer", "", 30);
            first_refer = getCookieUrl("first_referrer");
        } else {
            setCookieUrl("first_referrer", escape(first_referrer), 30);
            first_refer = getCookieUrl("first_referrer");
        }
    }
}