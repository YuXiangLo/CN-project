CXX = g++
CXXFLAGS = -std=c++11

all: server client

server: server.cpp
	$(CXX) $(CXXFLAGS) -o server server.cpp

client: client.cpp
	$(CXX) $(CXXFLAGS) -o client client.cpp

run: server
	./server

clean: 
	rm server client

