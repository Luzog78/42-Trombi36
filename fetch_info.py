import json
import time
import traceback

from color import print
from data import Data
from multithreading import async_func


global_data = {}


def fetch_error(endpoint, params, result):
	print(f'§4§lFailed to fetch on \'§c{endpoint}§4\'')
	print(f'§4§lResult:§c {result}')
	print(f'§4§lParams:§c {params}')


def fetch_info(auth, assign_global=True):
	endpoint = f'campus/{Data.CAMPUS_ID}/users'
	params = {
		'page': 1,
		'per_page': 100,
		'filter[staff?]': False,
		'filter[pool_year]': Data.POOL_YEAR,
		'filter[pool_month]': Data.POOL_MONTH,
	}
	users = Data.get_data(endpoint, auth, **params)
	if 'error' in users:
		return fetch_error(endpoint, params, users)
	if len(users) == 100:
		params['page'] = 2
		time.sleep(2)
		result = Data.get_data(endpoint, **params)
		if 'error' not in result:
			users += result
	with open(f'db/users ({Data.POOL_MONTH} {Data.POOL_YEAR}).json', 'w') as f:
		f.write(json.dumps(users, indent='\t'))

	try:
		with open(f'db/data ({Data.POOL_MONTH} {Data.POOL_YEAR}).json', 'r') as f:
			data = json.load(f)
		assert isinstance(data, dict)
	except Exception:
		data = {}
	data['piscineux'] = []
	for user in users:
		data['piscineux'].append({
			'id': user['id'],
			'login': user['login'],
			'firstName': user['first_name'],
			'lastName': user['last_name'],
			'fullName': user['displayname'],
			'email': user['email'],
			'phone':  user['phone'],
			'correctionPoint': user['correction_point'],
			'wallet': user['wallet'],
			'location': user['location'],
			'pictureURL': user['image']['link'],
			'active': user['active?'],
		})
	with open(f'db/data ({Data.POOL_MONTH} {Data.POOL_YEAR}).json', 'w') as f:
		f.write(json.dumps(data, indent='\t'))

	if assign_global:
		global global_data
		global_data = data
	return data


def fetch_user(id, auth):
	try:
		endpoint = f'users/{id}'
		user = Data.get_data(endpoint, auth)
		if 'error' in user:
			return fetch_error(endpoint, {}, user)
		with open(f'db/users/{user["login"]}.json', 'w') as f:
			f.write(json.dumps(user, indent='\t'))
		return user
	except Exception as e:
		print(f'§4§lError:§c {e}', end='\n')
		traceback.print_exc()
		print('§r', end='')


@async_func
def fetch_routine():
	Data.running = True
	while Data.running:
		print(f'§7Fetching users of {Data.POOL_MONTH} {Data.POOL_YEAR}\'s pool...')
		result = fetch_info(Data.AUTHORIZATION)
		if result is None:
			Data.running = False
			return
		else:
			users = global_data['piscineux']
		print(f'§aFetched §b{len(users)}§a users on §9{Data.POOL_MONTH} {Data.POOL_YEAR}§a!')
		time.sleep(3)

		for user in global_data['piscineux']:
			print(f'§7Fetching user §e{user["login"]}§7...')
			user = fetch_user(user['id'], Data.AUTHORIZATION)
			if user is not None:
				print(f'§aFetched user §b{user["login"]}§a!')
			time.sleep(3)


def check_whitelist(authorization):
	me = Data.get_data('me', authorization)
	if 'error' in me:
		print(f'§4§lFailed to fetch on \'§cme§4\'\n§c({me})')
		return False
	
	try:
		print(f'§aFetched user §b{me["login"]}§a!')

		with open(f'db/users/{me['login']}.json', 'w') as f:
			f.write(json.dumps(me, indent='\t'))
	except Exception:
		pass

	return me.get('login') in global_data.get('whitelist', [])
