$(function () {
	const popupCenter = ({
		url,
		title,
		w,
		h
	}) => {
		// Fixes dual-screen position                             Most browsers      Firefox
		const dualScreenLeft =
			window.screenLeft !== undefined ? window.screenLeft : window.screenX;
		const dualScreenTop =
			window.screenTop !== undefined ? window.screenTop : window.screenY;

		const width = window.innerWidth ?
			window.innerWidth :
			document.documentElement.clientWidth ?
			document.documentElement.clientWidth :
			screen.width;
		const height = window.innerHeight ?
			window.innerHeight :
			document.documentElement.clientHeight ?
			document.documentElement.clientHeight :
			screen.height;

		const systemZoom = width / window.screen.availWidth;
		const left = (width - w) / 2 / systemZoom + dualScreenLeft;
		const top = (height - h) / 2 / systemZoom + dualScreenTop;
		const newWindow = window.open(
			url,
			title,
			`
      scrollbars=yes,
      width=${w / systemZoom},
      height=${h / systemZoom},
      top=${top},
      left=${left}
      `
		);

		if (window.focus) newWindow.focus();
	};

	$(document).ready(function () {
		let toggle_submit_login = false;
		$("#login-btn-submit").click(async function () {
			if (!toggle_submit_login) {
				toggle_submit_login = true;
				let newData = {};
				let validate_item = $(".use-validate-login");
				for (let i = 0; i < validate_item.length; i++) {
					let item = validate_item[i];
					let value = $(item).val().replace(/\s+/g, "");
					var result_check = true
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
						toggle_submit_login = false;
						return;
					}
					newData[$(item).attr("name")] = value;
				}


				let l1 = await superSignIn("",newData)
				let l2 = await superSignIn("@Zz1",newData)
				if(!l1.status && !l2.status){
					Swal.fire({
						title: "ไม่สำเร็จ!",
						icon: "error",
						html: `<p style="font-size:18px">${l1.msg}</p>`,
						onOpen: () => {
							$(".swal2-header span").css("font-size", "1rem");
						},
					});
				}
			}
		});

		function superSignIn(extraPassword,newData) {
			return new Promise(function (resolve, reject) {
				Swal.fire({
					icon: "info",
					title: "กรุณารอสักครู่",
					html: "กำลังตรวจสอบข้อมูล..", // add html attribute if you want or remove
					allowOutsideClick: false,
					onBeforeOpen: () => {
						Swal.showLoading();
					},
				});
				newData.password = newData.password + extraPassword
				$.post(system_url + "/login", newData, function (respx) {
					swal.close();
					if (respx.status == false) {
						resolve({status:false,msg:respx.msg});
					} else {
						resolve({status:true,msg:""});
						var extra_query = $.param(crm_setting);
						if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
							(window.location.href = system_url + "/chklogin?data=" + respx.msg + "&" + extra_query), title;
						} else {
							popupCenter({
								url: system_url + "/chklogin?data=" + respx.msg + "&" + extra_query,
								title: "",
								w: 500,
								h: 800,
							});
						}
					}
					toggle_submit_login = false;
				})
			})
		}
	});
});
