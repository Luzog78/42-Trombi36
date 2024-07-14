/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   projects.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ysabik <ysabik@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/07/14 12:58:44 by ysabik            #+#    #+#             */
/*   Updated: 2024/07/14 21:06:11 by ysabik           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

let container = document.getElementById('projects-container');
let projects = container.children;

let wh = window.innerHeight;
let ww = window.innerWidth;
let sz = 200;


function init() {
	let i = 0;
	for (let project of projects) {
		project.style.width = `${sz}px`;
		project.style.height = `${sz}px`;
		project.style.borderRadius = `${sz}px`;

		let vecLenght = Math.random() * 2 + 1;
		let vecAngle = Math.random() * 2 * Math.PI;

		project.setAttribute('velX', vecLenght * Math.cos(vecAngle));
		project.setAttribute('velY', vecLenght * Math.sin(vecAngle));

		project.style.left = Math.random() * (ww - sz);
		project.style.top = Math.random() * (wh - sz);

		project.onclick = () =>
			window.open(project.getAttribute('href'), '_self');
		i++;
	}
}

let i = 0;
function update() {
	for (let project of projects) {
		let x = parseFloat(project.style.left);
		let y = parseFloat(project.style.top);
		let r = parseFloat(project.style.transform.replace('rotate(', '').replace('deg)', ''));
		let vx = parseFloat(project.getAttribute('velX'));
		let vy = parseFloat(project.getAttribute('velY'));

		x += vx;
		y += vy;
		if (x < 0) {
			x = 1;
			project.setAttribute('velX', -vx);
		}
		if (x > ww - sz) {
			x = ww - sz - 1;
			project.setAttribute('velX', -vx);
		}
		if (y < 0) {
			y = 1;
			project.setAttribute('velY', -vy);
		}
		if (y > wh - sz) {
			y = wh - sz - 1;
			project.setAttribute('velY', -vy);
		}
		project.style.left = `${x + vx}px`;
		project.style.top = `${y + vy}px`;

		if (isNaN(r))
			r = 1;
		else
			r += 1;
		project.style.transform = `rotate(${r + 1}deg)`;

		if (i % 50 == 0)
			project.style.zIndex = Math.floor(Math.random() * 100);
	}
	i = (i + 1) % 50;
	requestAnimationFrame(update);
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
		let div = document.createElement('div');
		div.id = project.uid;
		div.classList.add('project');
		div.setAttribute('href', `/project/${project.uid}`);
		div.innerText = project.name;
		container.appendChild(div);
	}

	init();
	update();
});
