#include <iostream>
#include <string>
#include <fstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <vector>

const int PORT = 8080;
std::vector<std::string> comments;  // Store comments in memory

std::string get_html_content(const std::string &filename) {
    std::ifstream file(filename);
    if (!file)
        return "File not found";

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

    size_t found = content.find("<!-- Individual comments will be placed here -->");
	for(auto& comment: comments){
		std::string replacement = "<div class=\"comment\">" + comment + "</div>\n" + 
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

    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    std::cout << "Serving profile.html on http://localhost:" << PORT << std::endl;

    while (true) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            perror("accept");
            exit(EXIT_FAILURE);
        }

		std::cout << "Accept a client: " << std::hex << ntohl(address.sin_addr.s_addr) << "\n";

        ssize_t bytes_read = read(new_socket, buffer, sizeof(buffer) - 1);
        buffer[bytes_read] = '\0';  // Null-terminate the buffer to make it a proper string

        std::string request(buffer);
        if (request.find("POST") == 0) {
            // Handle POST request
            size_t content_start = request.find("\r\n\r\n");
            if (content_start != std::string::npos) {
                std::string comment = request.substr(content_start + 4);
                comments.push_back(comment);
                std::cout << "Received comment: " << comment << "\n";
            }

            std::string response = "HTTP/1.1 200 OK\nContent-Type: text/plain\n\nSuccessfully send comment\n";
            send(new_socket, response.c_str(), response.size(), 0);
        } else {
			size_t start_path = request.find(" ") + 1;
			size_t end_path = request.find(" ", start_path);
			std::string path = request.substr(start_path, end_path - start_path);
			if(path == "/" || path == "profile.html"){
				std::cout << "request: " << request << "\n";
				std::string response = "HTTP/1.1 200 OK\nContent-Type: text/html\n\n" + get_html_content("profile.html");
				send(new_socket, response.c_str(), response.size(), 0);
			} else{
				path.erase(0, 1);
				std::string Log = "";
				if(path.find("jpg") != -1)
					Log = "image/jpeg";
				else if(path.find("pdf"))
					Log = "application/pdf";
				else if (path.find("mp4"))
					Log = "media/mp4";

				std::ifstream file(path, std::ios::binary);
				std::vector<char> content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

				std::string headers = "HTTP/1.1 200 OK\nContent-Type: " + Log + "\n\n";
				send(new_socket, headers.c_str(), headers.size(), 0);
				send(new_socket, &content[0], content.size(), 0);

			}	
        }

        close(new_socket);
    }

    return 0;
}

