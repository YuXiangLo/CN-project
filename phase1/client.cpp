#include <iostream>
#include <string>
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <arpa/inet.h>

const int PORT = 8080;

int main() {
    int sock = 0;
    struct sockaddr_in serv_addr;

    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        std::cerr << "Socket creation error" << std::endl;
        return -1;
    }

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);
    serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");

    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        std::cerr << "Connection failed" << std::endl;
        return -1;
    }

    std::cout << "Enter your comment: ";
    std::string comment;
    std::getline(std::cin, comment);

    std::string request = "POST / HTTP/1.1\r\n";
    request += "Host: localhost:8080\r\n";
    request += "Content-Length: " + std::to_string(comment.length()) + "\r\n";
    request += "\r\n";
    request += comment;

    send(sock, request.c_str(), request.size(), 0);

    char buffer[1024] = {0};
    read(sock, buffer, 1024);
    std::cout << "Server response: " << buffer << std::endl;

    close(sock);
    return 0;
}

