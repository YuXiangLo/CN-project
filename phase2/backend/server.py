import socket
import threading
from http_requests import handle_client_connection, write_to_csv, Account_list

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind(('0.0.0.0', 4000))
    server_socket.listen(5)
    print('Server listening on port 4000')

    try:
        while True:
            client_socket, addr = server_socket.accept()
            client_thread = threading.Thread(target=handle_client_connection, args=(client_socket,))
            client_thread.start()
    except KeyboardInterrupt:
        print("Shutting down the server")
    finally:
        write_to_csv('account.csv', Account_list)
        server_socket.close()
        print("Closing server")

if __name__ == '__main__':
    main()
