import random
import urllib
import requests
from flask import Flask, session


class Data:
	KEY				= ''.join(chr(random.randint(32, 126)) for _ in range(100))

	PORT			= 25577
	URL				= f'http://luzog.fr:{PORT}/'

	TOKEN_UID		= ''
	TOKEN_SECRET	= ''
	AUTHORIZATION	= ''
	SCOPE			= 'public'
	REDIRECT_URI	= f'{URL}auth'
	REDIRECT_SAFE	= urllib.parse.quote(REDIRECT_URI, safe='')
	STATE			= '42'

	X_CODE			= 'code'
	X_FULL_TOKEN	= 'full_token'
	X_ACCESS_TOKEN	= 'access_token'
	X_REFRESH_TOKEN	= 'refresh_token'

	API_URL			= 'https://api.intra.42.fr/v2/'
	API_AUTH_URL	= 'https://api.intra.42.fr/oauth/authorize'
	API_TOKEN_URL	= 'https://api.intra.42.fr/oauth/token'

	CAMPUS_ID		= 31 # Angoulême
	POOL_YEAR		= 2024
	POOL_MONTH		= 'july'

	API_AUTH		= f'{API_AUTH_URL}?client_id={"{}"}&redirect_uri={REDIRECT_SAFE}&response_type=code&scope={SCOPE}&state={STATE}'

	app				= Flask(__name__, static_url_path='/static', static_folder='static')
	running			= False

	@staticmethod
	def get_token(code):
		data = {
			'grant_type': 'authorization_code',
			'client_id': Data.TOKEN_UID,
			'client_secret': Data.TOKEN_SECRET,
			'code': code,
			'redirect_uri': Data.REDIRECT_URI,
		}
		response = requests.post(Data.API_TOKEN_URL, data=data)
		return response.json()

	@staticmethod
	def get_url(url, api_url=True, *args, **kwargs):
		SAFE = '$@?![]:+-_,'
		quote = urllib.parse.quote
		if args or kwargs:
			url += '?'
		for arg in args:
			url += quote(f'{arg}', safe=SAFE) + '&'
		for k, v in kwargs.items():
			url += quote(f'{k}', safe=SAFE) + '=' + quote(f'{v}', safe=SAFE) + '&'
		if args or kwargs:
			url = url[:-1]
		if api_url:
			url = Data.API_URL + url
		return url

	@staticmethod
	def get_data(url, auth=None, *args, **kwargs):
		headers = { 'Authorization': f'Bearer {auth}' }
		url_safe = Data.get_url(url, *args, **kwargs)
		response = requests.get(url_safe, headers=headers)
		try:
			response = response.json()
		except Exception:
			response = { 'error': response.text, 'url': url_safe }
		return response


Data.app.config['SECRET_KEY'] = Data.KEY
Data.app.secret_key = Data.KEY
