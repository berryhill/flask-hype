from rauth import OAuth1Service
import requests
import json
from urlparse import urlparse, parse_qs

class API:
	def __init__(self):

	    self.data = []

	def start(self):

		try:
			f = open('beatport-auth.json')
			self.data = json.load(f)

			beatport = OAuth1Service(
			    name='beatport',
			    consumer_key=self.data['consumer_key'],
			    consumer_secret=self.data['consumer_secret'],
			    request_token_url= 'https://oauth-api.beatport.com/identity/1/oauth/request-token',
			    access_token_url='https://oauth-api.beatport.com/identity/1/oauth/access-token',
			    authorize_url='https://oauth-api.beatport.com/identity/1/oauth/authorize',
			    base_url='https://oauth-api.beatport.com/json/catalog')

			request_token, request_token_secret = beatport.get_request_token(method='POST', data={
			    'oauth_callback': 'http://oauth-api.beatport.com'})

			authorize_url = beatport.get_authorize_url(request_token)

			values = {
			    'oauth_token': request_token,
			    'username': self.data['username'],
			    'password': self.data['password'],
			    'submit' : 'Login',
			}

			r = requests.post('https://oauth-api.beatport.com/identity/1/oauth/authorize-submit', data=values)

			# pull the verifer out of the URL string
			verifier = parse_qs(urlparse(r.url).query)['oauth_verifier'][0]

			tokens = beatport.get_raw_access_token(request_token, request_token_secret, method='POST', data={
			    'oauth_verifier': verifier})

			token_string = tokens.content

			# token_string is a query string, pull the variables out using parse_qs
			access_token = parse_qs(token_string)['oauth_token'][0]
			access_token_secret = parse_qs(token_string)['oauth_token_secret'][0]

			session = beatport.get_session((access_token, access_token_secret))

			self.session = session

		except IOError as e:

			print 'Could not locate beatport-auth.json.\n' \
	    		'This file is contains your Beatport credentials used in the API authentication'

	def request(self, endpoint, data):

		r = self.session.get('https://oauth-api.beatport.com/' + endpoint, params=data)
		#print r.content
		return r.content
