import json
import waitress
from flask import request, session, jsonify, render_template, send_file, redirect

from color import print
from data import Data
from fetch_info import fetch_routine, check_whitelist, global_data


forbidden_authorizations = []


@Data.app.route('/')
def route_index():
	return redirect('/trombi')


@Data.app.route('/trombi')
def route_trombi():
	return render_template('trombi.html')


@Data.app.route('/projects')
def route_projects():
	return render_template('projects.html')


@Data.app.route('/ranking')
def route_ranking():
	return render_template('project.html')


@Data.app.route('/project/<project>')
def route_project(project: str | None = None):
	if project is None:
		return redirect('/projects')

	with open(f'db/projects.json', 'r') as f:
		projects = json.load(f)
	projects = projects.get('projects', [])
	project_data = None
	for p in projects:
		if p['uid'] == project:
			project_data = p
			break
	if project_data is None:
		return jsonify({'error': '404 Not Found'}), 404
	return render_template('project.html')


@Data.app.route('/db/data.json')
def db_data_json():
	if not session.get(Data.X_ACCESS_TOKEN):
		return jsonify({
			"tutors": [
				{
					"login": "jeff",
					"firstName": "Le J",
					"pictureURL": "https://risibank.fr/cache/medias/0/21/2155/215576/full.gif"
				} for _ in range(10)
			],
			"piscineux": [
				{
					"login": "jeff",
					"firstName": "Le J",
					"pictureURL": "https://risibank.fr/cache/medias/0/21/2155/215576/full.gif"
				} for _ in range(31)
			]
		})
	month = f'{request.args.get("month", default=Data.POOL_MONTH)}'.replace('/', '').replace('\\', '')[:32]
	year = f'{request.args.get("year", default=Data.POOL_YEAR)}'.replace('/', '').replace('\\', '')[:32]
	filename = f'db/data__({month}__{year}).json'
	try:
		return send_file(filename)
	except Exception:
		return jsonify({'error': '404 Not Found'}), 404


@Data.app.route('/db/user.json')
def db_user_json():
	if not session.get(Data.X_ACCESS_TOKEN):
		return jsonify({'error': '401 Unauthorized'}), 401
	
	if not request.args.get('login') and not request.args.get('logins'):
		return jsonify({'error': '400 Bad Request: Forgot "login" or "logins" argument'}), 400
	
	if request.args.get('logins'):
		logins = request.args.get('logins').split(',')
		users = []
		for login in logins:
			filename = f'db/users/{login}.json'
			try:
				with open(filename, 'r') as f:
					users.append(json.load(f))
			except Exception:
				users.append({'error': '404 Not Found', 'login': login})
		return jsonify(users)

	login = f'{request.args.get("login")}'.replace('/', '').replace('\\', '')[:32]
	filename = f'db/users/{login}.json'
	try:
		return send_file(filename)
	except Exception:
		return jsonify({'error': '404 Not Found'}), 404


@Data.app.route('/db/projects.json')
def db_projects_json():
	if not session.get(Data.X_ACCESS_TOKEN):
		return jsonify({'error': '401 Unauthorized'}), 401
	filename = f'db/projects.json'
	try:
		return send_file(filename)
	except Exception:
		return jsonify({'error': '404 Not Found'}), 404


@Data.app.route('/token', methods=['GET', 'POST'])
def route_token():
	if request.method == 'POST':
		session[Data.X_FULL_TOKEN] = { k: request.form.get(k) for k in request.form.keys() }
		session[Data.X_ACCESS_TOKEN] = request.form.get('access_token')
		session[Data.X_REFRESH_TOKEN] = request.form.get('refresh_token')
		session.modified = True
	return jsonify(session.get(Data.X_FULL_TOKEN, default={}))


@Data.app.route('/auth')
def route_auth():
	redirect_pathname = request.args.get('redirect')
	if redirect_pathname is None:
		if session.get('redirect'):
			redirect_pathname = session.get('redirect')
			session['redirect'] = None
		else:
			redirect_pathname = '/'

	if session.get(Data.X_ACCESS_TOKEN):
		redirect(redirect_pathname)

	if request.args.get('code'):
		session[Data.X_CODE] = request.args.get('code')
		session.modified = True

	if session.get(Data.X_CODE):
		response = Data.get_token(session.get(Data.X_CODE))
		session[Data.X_CODE] = None

		authorization = response.get(Data.X_ACCESS_TOKEN)
		if authorization in forbidden_authorizations or not check_whitelist(authorization):
			forbidden_authorizations.append(authorization)
			session.modified = True
			return jsonify({'error': '403 Forbidden: You are not in the whitelist'}), 403

		session[Data.X_FULL_TOKEN] = response
		session[Data.X_ACCESS_TOKEN] = authorization
		session[Data.X_REFRESH_TOKEN] = response.get(Data.X_REFRESH_TOKEN)
		session.modified = True
		Data.AUTHORIZATION = authorization
		try:
			with open('db/authorization.key', 'w') as f:
				f.write(Data.AUTHORIZATION + '\n')
		except Exception:
			pass
		if not Data.running:
			fetch_routine()
		return redirect(redirect_pathname)

	session["redirect"] = redirect_pathname
	return redirect(Data.API_AUTH)


@Data.app.route('/logout')
def route_logout():
	redirect_pathname = request.args.get('redirect', default='/')
	session[Data.X_CODE] = None
	session[Data.X_FULL_TOKEN] = None
	session[Data.X_ACCESS_TOKEN] = None
	session[Data.X_REFRESH_TOKEN] = None
	session.modified = True
	return redirect(redirect_pathname)


@Data.app.errorhandler(404)
def err_404(e):
	return jsonify({'error': '404 Not Found'}), 404


if __name__ == '__main__':
	try:
		with open('db/trombi36.key', 'r') as f:
			Data.TOKEN_UID = f.read()
		if not Data.TOKEN_UID:
			raise Exception('Missing UID and secret tokens')
		if '\n' not in Data.TOKEN_UID:
			raise Exception('Missing secret token')
		splitted = Data.TOKEN_UID.split('\n')
		Data.TOKEN_UID = splitted[0]
		Data.TOKEN_SECRET = splitted[1]
		Data.API_AUTH = Data.API_AUTH.format(Data.TOKEN_UID)
		print(f'§2API Tokens loaded:\n > §a{Data.TOKEN_UID}\n§2 > §7§o{Data.TOKEN_SECRET}')
	except Exception as e:
		print(f'§4Error while loading API Tokens: §c{e}')
		pass

	try:
		with open(f'db/data__({Data.POOL_MONTH}__{Data.POOL_YEAR}).json', 'r') as f:
			data = json.load(f)
		assert isinstance(data, dict)
		for k, v in data.items():
			global_data[k] = v
		print(f'§2Data loaded: §e{Data.POOL_MONTH} {Data.POOL_YEAR}')
	except Exception as e:
		print(f'§4Error while loading data: §c{e}')
		pass

	try:
		with open('db/authorization.key', 'r') as f:
			Data.AUTHORIZATION = f.read()
		if '\n' in Data.AUTHORIZATION:
			Data.AUTHORIZATION = Data.AUTHORIZATION.split('\n')[0]
		print(f'§2Authorization key loaded: §a{Data.AUTHORIZATION}')
		fetch_routine()
	except Exception as e:
		print(f'§4Error while loading authorization key: §c{e}')
		pass

	try:
		print(f'§2Starting server on port §d{Data.PORT}')
		# Data.app.run(port=Data.PORT, host='0.0.0.0')
		waitress.serve(Data.app, port=Data.PORT, host='0.0.0.0')
		print(f'\n§2Server running on:§r\n §7> §fPort: §d{Data.PORT}§r\n §7> §fURL: §d{Data.URL}§r\n')
	except Exception as e:
		print(f'§4Error while running server: §c{e}')
		Data.running = False
		exit(1)
