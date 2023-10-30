#include <iostream>
#include <string>
#include <fstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <vector>

using namespace std;

const int PORT = 8080;
vector<string> comments;  // Store comments in memory

string get_html_content(const string &filename) {
    ifstream file(filename);
    if (!file) return "File not found";

    string content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());

    size_t found = content.find("<!-- Individual comments will be placed here -->");
	for(auto& comment: comments){
		string replacement = "<div class=\"comment\">" + comment + "</div>\n" + 
								  "<!-- Individual comments will be placed here -->";
		content.replace(found, strlen("<!-- Individual comments will be placed here -->"), replacement);
		found = content.find("<!-- Individual comments will be placed here -->");
	}
    return content;
}

int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);
    char buffer[2048] = {0};

    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(PORT);

    if (::bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    cout << "Serving profile.html on http://localhost:" << PORT << '\n';

    while (true) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            perror("accept");
            exit(EXIT_FAILURE);
        }

		cout << "Accept a client: " << hex << ntohl(address.sin_addr.s_addr) << "\n";

        ssize_t bytes_read = read(new_socket, buffer, sizeof(buffer) - 1);
        buffer[bytes_read] = '\0';  // Null-terminate the buffer to make it a proper string

        string request(buffer);
        if (request.find("POST") == 0) {
            // Handle POST request
            size_t content_start = request.find("\r\n\r\n");
            if (content_start != string::npos) {
                string comment = request.substr(content_start + 4);
                comments.push_back(comment);
                cout << "Received comment: " << comment << "\n";
            }

            string response = "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nSuccessfully send comment\n";
            send(new_socket, response.c_str(), response.size(), 0);
        } else {
			size_t start_path = request.find(" ") + 1;
			size_t end_path = request.find(" ", start_path);
			string path = request.substr(start_path, end_path - start_path);
			if(path == "/" || path == "profile.html"){
				cout << "request: " << request << "\n";
				string response = "HTTP/1.1 200 OK\nContent-Type: text/html\n\n" + get_html_content("profile.html");
				send(new_socket, response.c_str(), response.size(), 0);
			} else{
				string Log = "";
				if(path.find("jpg") != -1)
					Log = "image/jpeg";
				else if(path.find("pdf") != -1)
					Log = "application/pdf";
				else if (path.find("mp4") != -1)
					Log = "media/mp4";

				path = "media" + path;

				ifstream file(path, ios::binary);
				vector<char> content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());

				string headers = "HTTP/1.1 200 OK\nContent-Type: " + Log + "\n\n";
				send(new_socket, headers.c_str(), headers.size(), 0);
				send(new_socket, &content[0], content.size(), 0);

			}	
        }

        close(new_socket);
    }

    return 0;
}

