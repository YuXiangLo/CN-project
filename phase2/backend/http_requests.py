import json
import csv
import os

def read_accounts_from_csv():
    accounts = []
    try:
        with open('account.csv', mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                accounts.append({'account': row['account'], 'passwd': row['passwd']})
    except FileNotFoundError:
        print("Account.csv not found, starting with an empty account list.")
    except Exception as e:
        print(f"An error occurred while reading the CSV file: {e}")
    return accounts

def write_to_csv(file_name, dict_list):
    try:
        with open(file_name, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['account', 'passwd'])
            writer.writeheader()
            for item in dict_list:
                writer.writerow(item)
    except IOError as e:
        print(f"An error occurred while writing to the CSV file: {e}")

Account_list = read_accounts_from_csv()

def handle_options_request():
    return (
        'HTTP/1.1 204 No Content\n'
        'Access-Control-Allow-Origin: *\n'
        'Access-Control-Allow-Methods: GET, POST, OPTIONS\n'
        'Access-Control-Allow-Headers: Content-Type\n'
        'Access-Control-Max-Age: 86400\n'
        '\n'
    )

def parse_http_request(request_text):
    headers, _, body = request_text.partition('\r\n\r\n')
    request_line = headers.splitlines()[0]
    method, path, _ = request_line.split()
    return method, path, headers, body

cookies_list = []
def handle_login_request(body):
    data = json.loads(body)
    decrypted_password = data["passwd"]
    if data in Account_list:
        response_body = f'{data["account"]}'
        cookies_list.append(data['account'])
    else:
        response_body = 'Fail to login'
    response = (
        'HTTP/1.1 200 OK\n'
        'Content-Type: text/plain\n'
        f'Content-Length: {len(response_body)}\n'
        'Access-Control-Allow-Origin: *\n'
        '\n'
        f'{response_body}'
    )
    return response

def handle_register_request(body):
    data = json.loads(body)
    if any(account['account'] == data['account'] for account in Account_list):
        response = (
            'HTTP/1.1 406 Repeated Register\n'
            'Content-Type: text/plain\n'
            'Access-Control-Allow-Origin: *\n'
            '\n'
            f'Fail to register'
        )
    else:
        Account_list.append(data)
        response = (
            'HTTP/1.1 200 OK\n'
            'Content-Type: text/plain\n'
            'Access-Control-Allow-Origin: *\n'
            '\n'
            f'Success register'
        )
    return response

comments = []
def handle_comments_request(body):
    data = json.loads(body)
    comments.append(data)
    response_body = "Success"
    response = (
        'HTTP/1.1 200 OK\n'
        'Content-Type: text/plain\n'
        f'Content-Length: {len(response_body)}\n'
        'Access-Control-Allow-Origin: *\n'
        '\n'
        f'{response_body}'
    )
    return response

def handle_get_comments_request():
    response_body = json.dumps(comments)
    response = (
        'HTTP/1.1 200 OK\n'
        'Content-Type: application/json\n'
        f'Content-Length: {len(response_body)}\n'
        'Access-Control-Allow-Origin: *\n'
        '\n'
        f'{response_body}'
    )
    return response

def handle_get_video_request(client_socket, path):
    file_path = os.path.join(os.getcwd(), path.lstrip('/'))

    if not os.path.exists(file_path):
        client_socket.sendall('HTTP/1.1 404 Not Found\r\nAccess-Control-Allow-Origin: *\r\n\r\n'.encode())
        return

    try:
        with open(file_path, 'rb') as file:
            headers = (
                'HTTP/1.1 200 OK\r\n'
                'Access-Control-Allow-Origin: *\r\n'
                'Content-Type: video/mp4\r\n' 
                'Connection: close\r\n'
                '\r\n'
            )
            client_socket.sendall(headers.encode())

            while True:
                data = file.read(1024 * 1024)  
                if not data:
                    break
                client_socket.sendall(data)
            client_socket.close()

    except IOError as e:
        print(f"Error reading file: {e}")
        client_socket.sendall('HTTP/1.1 500 Internal Server Error\r\nAccess-Control-Allow-Origin: *\r\n\r\n'.encode())

def handle_get_cookies_request(body):
    data = json.loads(body)
    cookies = data.get("cookies", "")

    is_valid_cookie = cookies in cookies_list

    response_body = 'true' if is_valid_cookie else 'false'
    response = (
        'HTTP/1.1 200 OK\n'
        'Content-Type: text/plain\n'
        f'Content-Length: {len(response_body)}\n'
        'Access-Control-Allow-Origin: *\n'
        '\n'
        f'{response_body}'
    )
    return response



def handle_client_connection(client_socket):
    request = client_socket.recv(4096).decode('utf-8')

    method, path, headers, body = parse_http_request(request)
    response = (
        'HTTP/1.1 451 Unavailable For Legal Reasons\n'
        'Access-Control-Allow-Origin: *\n'
        '\n'
        'Permission not allowed'
    )

    print(f"method: {method}, path: {path}")
    if method == 'OPTIONS':
        response = handle_options_request().encode()
    elif method == 'GET':
        if path == '/comments':
            response = handle_get_comments_request().encode()
        elif path.startswith('/video/'):
            handle_get_video_request(client_socket, path)
            return
    elif method == 'POST':
        body = client_socket.recv(4096).decode('utf-8')
        if path == '/login':
            response = handle_login_request(body).encode()
        elif path == '/register':
            response = handle_register_request(body).encode()
        elif path == '/comments':
            response = handle_comments_request(body).encode()

    client_socket.sendall(response)
    client_socket.close()

