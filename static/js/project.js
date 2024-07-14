/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   project.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ysabik <ysabik@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/07/14 13:53:38 by ysabik            #+#    #+#             */
/*   Updated: 2024/07/14 21:05:56 by ysabik           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const container = document.querySelector('.container');
const presence = document.getElementById('info-presence');
const average = document.getElementById('info-average');

const gradStart = [240, 0, 0];
const gradEnd = [51, 204, 51];
const gradStep = 40;

const disabledColor = '#888';


let mutex = false;


function toHex(r, g, b) {
	let hex = '#';
	hex += r.toString(16).padStart(2, '0');
	hex += g.toString(16).padStart(2, '0');
	hex += b.toString(16).padStart(2, '0');
	return hex;
}

function gradient(start, end, t) {
	let sr = start[0];
	let sg = start[1];
	let sb = start[2];

	let er = end[0];
	let eg = end[1];
	let eb = end[2];

	if (t < 0) t = 0;
	if (t > 1) t = 1;

	let r = sr + (er - sr) * t;
	let g = sg + (eg - sg) * t;
	let b = sb + (eb - sb) * t;

	return `rgb(${r}, ${g}, ${b})`;
}

class Profile {
	constructor(login, picture, mark, validated) {
		this.login = login;
		this.picture = picture;
		this.mark = 0;
		this.validated = false;

		this.row = document.createElement('div');
		this.row.classList.add('row');

		this.markLeft = document.createElement('div');
		this.markLeft.classList.add('mark-left');
		this.row.appendChild(this.markLeft);

		this.left = document.createElement('div');
		this.left.classList.add('left');
		this.row.appendChild(this.left);

		this.center = document.createElement('div');
		this.center.classList.add('center');
		this.center.onclick = () =>
			window.open(`https://profile.intra.42.fr/users/${login}`, '_blank').focus();

		this.img = document.createElement('img');
		this.img.classList.add('picture');
		this.img.alt = login;
		this.img.src = picture ? picture : '';
		this.center.appendChild(this.img);

		this.loginDiv = document.createElement('div');
		this.loginDiv.classList.add('login');
		this.loginDiv.innerText = login;
		this.center.appendChild(this.loginDiv);

		this.row.appendChild(this.center);

		this.right = document.createElement('div');
		this.right.classList.add('right');
		this.row.appendChild(this.right);

		this.markRight = document.createElement('div');
		this.markRight.classList.add('mark-right');
		this.row.appendChild(this.markRight);

		this.setMark(mark, validated);
	}

	async setMark(mark, validated) {
		let oldMark = this.mark;

		this.mark = mark;
		this.validated = validated;

		while (mutex)
			await new Promise(r => setTimeout(r, 100));

		// Opacity is dimmed if the user didn't push the project
		if (mark == -1)
			this.row.style.opacity = '.75';
		else
			this.row.style.opacity = '1';

		// Change the mark labels (mainly the colors)
		if (mark == -1) {
			this.markLeft.style.color = disabledColor;
			this.markRight.style.color = disabledColor;
		} else if (validated) {
			this.markLeft.style.color =  toHex(...gradEnd);
			this.markRight.style.color = toHex(...gradEnd);
		} else {
			this.markLeft.style.color = toHex(...gradStart);
			this.markRight.style.color = toHex(...gradStart);
		}
		this.markLeft.innerText = mark == -1 ? 'N/A' : oldMark;
		this.markRight.innerText = mark == -1 ? 'N/A' : oldMark;

		// Change the gradient bars
		this.left.innerHTML = '';
		this.right.innerHTML = '';
		function appendBar(i) {
			let div = document.createElement('div');
			div.style.background = gradient(gradStart, gradEnd, i / gradStep);
			this.left.appendChild(div);

			div = document.createElement('div');
			div.style.background = gradient(gradStart, gradEnd, i / gradStep);
			this.right.appendChild(div);

			this.markLeft.innerText = i + 1;
			this.markRight.innerText = i + 1;
		}
		let j = 0;
		for (let i = 0; i < mark; i++, j++) {
			if (i < oldMark) {
				appendBar.call(this, i);
				j = -1;
			} else
				setTimeout((i) => appendBar.call(this, i), j * 20 + 400, i);
		}

		await new Promise(r => setTimeout(r, j * 20 + 1500));
	}

	push() {
		container.appendChild(this.row);
	}
}


let piscineux = [];
let users = [];
let averageMark = 0;
let presentUsersLength = 0;


function calcInfo() {
	averageMark = 0;
	presentUsersLength = 0;
	for (let user of users) {
		if (user.mark != -1) {
			averageMark += user.mark;
			presentUsersLength++;
		}
	}
	averageMark /= presentUsersLength;
	presence.innerText = `${presentUsersLength}/${users.length}`;
	average.innerText = isNaN(averageMark) ? 'N/A' : `${averageMark.toFixed(2)}%`;
}

async function sortUsers() {
	let oldLogins = users.map(u => u.login);

	users.sort((a, b) => b.mark - a.mark);

	let newLogins = users.map(u => u.login);

	for (let i = 0; i < users.length; i++) {
		let oldIndex = oldLogins.indexOf(newLogins[i]);
		if (oldIndex != i) {
			let oldRow = container.children[oldIndex];
			if (oldIndex > i) {
				let j = i;
				while (oldIndex > j) {
					container.insertBefore(oldRow, oldRow.previousElementSibling);
					await new Promise(r => setTimeout(r, 500));
					j++;
				}
			} else {
				let j = i;
				while (oldIndex < j) {
					container.insertBefore(oldRow, oldRow.nextElementSibling);
					await new Promise(r => setTimeout(r, 500));
					j--;
				}
			}
		}
	}
}

async function refreshMarks(slug, firstTime = false) {
	let marks = {};
	if (!firstTime) {
		for (let user of users) {
			marks[user.login] = user.mark;
		}
	}
	for (let p of piscineux) {
		let userData = await fetch(`/db/user.json?login=${p.login}`);
		let userJson = await userData.json();

		if (!userJson || userJson.error) {
			window.open(window.location.href, '_self');
			return;
		}

		let userFinalMark = -1;
		let validated = false;
		let userProjects = userJson.projects_users;
		for (let userProject of userProjects) {
			if (userProject.marked && userProject.project.slug == slug
					&& userProject.final_mark > userFinalMark) {
				userFinalMark = userProject.final_mark;
				validated = userProject['validated?'];
			}
		}

		if (firstTime) {
			let user = new Profile(p.login, userJson.image.link, userFinalMark, validated);
			users.push(user);
		} else if (marks[p.login] != userFinalMark) {
			let user = users.find(u => u.login === p.login);
			await user.setMark(userFinalMark, validated);
			calcInfo();
			await sortUsers();
		}
	}
}

async function ff(slug, name) {
	mutex = true;

	let data = await fetch('/db/data.json');
	let dataJson = await data.json();

	if (!data || data.error) {
		window.open(window.location.href, '_self');
		return;
	}

	piscineux = dataJson.piscineux;
	await refreshMarks(slug, true);

	users.sort((a, b) => b.mark - a.mark);
	for (let user of users) {
		user.push();
	}
	calcInfo();

	mutex = false;

	setInterval(async () => {
		if (mutex)
			return;
		mutex = true;
		await refreshMarks(slug);
		mutex = false;
	}, 5000);
}

async function reloadSession() {
	let token = await fetch('/token').then(res => res.text());
	token = [JSON.parse(token), token];
	if (token[0].access_token) {
		localStorage.setItem('ft_token', token[1]);
		auth42.parentElement.style.display = 'none';
		logout.parentElement.style.display = 'block';
	} else {
		localStorage.removeItem('ft_token');
		auth42.parentElement.style.display = 'block';
		logout.parentElement.style.display = 'none';
	}
}


reloadSession();

let auth42 = document.getElementById('auth42');
auth42.parentElement.onclick = () =>
	window.open('/auth?redirect=' + window.location.pathname, '_self');

let logout = document.getElementById('logout');
logout.parentElement.onclick = () =>
	window.open('/logout', '_self');

fetch('/db/projects.json').then(async response => {
	if (!response.ok) {
		container.innerHTML = 'Error loading the projects.<br>Try to sign in again.';
		container.style.color = 'red';
		container.style.textAlign = 'center';
		container.style.fontSize = '2em';
		container.style.fontWeight = 'bold';
		return;
	}

	let data = await response.json();
	let uid = window.location.pathname.split('/');
	uid = uid[uid.length - 1];

	for (let project of data.projects) {
		if (project.uid === uid) {
			ff(project.slug, project.name);
			break;
		}
	}
});
