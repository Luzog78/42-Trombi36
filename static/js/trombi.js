/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   trombi.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ysabik <ysabik@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2024/07/11 21:50:57 by ysabik            #+#    #+#             */
/*   Updated: 2024/07/16 18:28:07 by ysabik           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


window.DEFAULT_BG = 'https://www.merci-app.com/app/uploads/2023/07/64a7c71cff2bd8a5b3531195_image-libre-droit-blog-cover-1024x504.png';


const bg = document.getElementById('bg');
const auth42 = document.getElementById('auth42');
const logout = document.getElementById('logout');
const tutors = document.getElementById('tutors');
const piscineux = document.getElementById('piscineux');
const show = document.getElementById('show-info');
const hide = document.getElementById('hide-info');
const search = document.getElementById('search');

let cards = [];
let searchFocused = false;


function animate(card, reverse = false, duration = 2) {
	if (card.getAttribute('animating') === 'true')
		return;
	card.setAttribute('animating', 'true');
	card.style.animationName = 'rotate';
	card.style.animationDuration = `${duration}s`;
	card.style.animationIterationCount = '1';
	if (reverse)
		card.style.animationDirection = 'reverse';
	setTimeout(() => {
		card.style.animationName = '';
		card.setAttribute('animating', 'false');
	}, duration * 1000);
}


function newCard(student, isTutor) {
	const card = document.createElement('div');
	card.id = `user-${student.login}`;
	card.classList.add('user');
	if (isTutor)
		card.classList.add('tutor');
	card.setAttribute('animating', 'false');
	card.setAttribute('info-level', '2');
	card.onclick = () => window.open(`https://profile.intra.42.fr/users/${student.login}`, '_blank');
	card.onmouseenter = () => {
		if (card.getAttribute('info-level') === '0') {
			card.querySelector('.name').style.opacity = '0';
			card.querySelector('.login').style.opacity = '1';
			card.setAttribute('info-level', '1');
		} else if (card.getAttribute('info-level') === '1') {
			card.querySelector('.name').style.opacity = '1';
			card.querySelector('.login').style.opacity = '1';
			card.setAttribute('info-level', '2');
		}
		animate(card);
	};
	card.onmouseleave = () => animate(card, true);

	const img = document.createElement('img');
	img.classList.add('picture');
	img.src = student.pictureURL;
	img.alt = student.firstName;
	card.appendChild(img);

	const info = document.createElement('div');
	info.classList.add('info');

	const display = document.createElement('div');
	display.classList.add('display');

	const name = document.createElement('h4');
	name.classList.add('name');
	name.textContent = student.firstName;
	display.appendChild(name);

	if (student.location) {
		const location = document.createElement('h5');
		location.classList.add('location');
		location.textContent = student.location;
		display.appendChild(location);
	}

	info.appendChild(display);

	const login = document.createElement('h5');
	login.classList.add('login');
	login.textContent = student.login;
	info.appendChild(login);

	card.appendChild(info);

	if (isTutor)
		tutors.appendChild(card);
	else
		piscineux.appendChild(card);
	cards.push(card);
}


show.onclick = () => cards.forEach(card => {
	card.querySelector('.name').style.opacity = '1';
	card.querySelector('.login').style.opacity = '1';
	card.setAttribute('info-level', '2');
});


hide.onclick = () => cards.forEach(card => {
	card.querySelector('.name').style.opacity = '0';
	card.querySelector('.login').style.opacity = '0';
	card.setAttribute('info-level', '0');
});


function removeAccents(str) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}


function updateSearch() {
	let value = removeAccents(search.value).toLowerCase();
	cards.forEach(card => {
		let content = removeAccents(card.querySelector('.name').textContent
				+ card.querySelector('.login').textContent).toLowerCase();

		valid = true;
		for (let i = 0; i < value.length; i++)
			if (!content.includes(value[i])) {
				valid = false;
				break;
			} else
				content = content.slice(content.indexOf(value[i]) + 1);

		if (valid)
			card.style.display = 'flex';
		else
			card.style.display = 'none';
	});
}


function showSearch() {
	searchFocused = true;
	search.parentElement.style.display = 'block';
	search.focus();
	search.select();
	search.parentElement.style.animationName = 'appear';
	search.parentElement.style.animationDuration = `.4s`;
	search.parentElement.style.animationTimingFunction = 'ease-out';
	search.parentElement.style.animationIterationCount = '1';
	search.parentElement.style.animationDirection = '';
	setTimeout(() => search.parentElement.style.animationName = '', 400);
}


function hideSearch(show = true) {
	searchFocused = false;
	search.blur();
	search.parentElement.style.animationName = 'appear';
	search.parentElement.style.animationDuration = `.4s`;
	search.parentElement.style.animationTimingFunction = 'ease-out';
	search.parentElement.style.animationIterationCount = '1';
	search.parentElement.style.animationDirection = 'reverse';
	setTimeout(() => search.parentElement.style.display = 'none', 400);
	if (show)
		cards.forEach(card => card.style.display = 'flex');
}


const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY0123456789 ?/.-=*+!@#$%^&|';


document.onkeydown = e => {
	if (!searchFocused && (chars.includes(e.key) || e.key === 'Control' || e.key === 'Shift' || e.key === 'Tab' || e.key === 'CapsLock')) {
		showSearch();
		if (chars.includes(e.key))
			search.value = e.key;
		e.preventDefault();
		setTimeout(updateSearch, 10);
	}
	if (search.hasAttribute('focused') && e.key === 'Escape')
		hideSearch();
};


search.onkeydown = e => {
	if (e.key === 'Escape') {
		hideSearch();
		return;
	}
	if (e.key === 'Backspace' && search.value.length == 1) {
		search.value = '';
		hideSearch();
		return;
	}
	if (e.key === 'Enter') {
		hideSearch(false);
		return;
	}

	setTimeout(updateSearch, 10);
};


async function reloadScript() {
	tutors.innerHTML = '';
	piscineux.innerHTML = '';
	search.value = '';

	window.DATA = await fetch('/db/data.json').then(res => res.json());
	if (window.DATA.bg)
		bg.src = window.DATA.bg;
	else
		bg.src = window.DEFAULT_BG;
	window.DATA.tutors.forEach(student => newCard(student, true));
	window.DATA.piscineux.forEach(student => newCard(student, false));
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


window.reloadScript = reloadScript;
window.DATA = {};

auth42.parentElement.onclick = () =>
	window.open('/auth?redirect=' + window.location.pathname, '_self');
logout.parentElement.onclick = () =>
	window.open('/logout', '_self');

bg.src = window.DEFAULT_BG;
reloadSession();
reloadScript();
