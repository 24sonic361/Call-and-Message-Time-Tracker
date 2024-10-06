CREATE DATABASE Calls_Messages_Time_Tracker

GO
USE Calls_Messages_Time_Tracker
GO

CREATE TABLE USERS (
    U_ID INT PRIMARY KEY,        -- Primary Key, unique identifier
    U_Name NVARCHAR(100),          -- Name of the user, up to 100 characters
    Email NVARCHAR(255),         -- Email of the user, up to 255 characters
    PhoneNumber NVARCHAR(15),    -- Phone number, up to 15 characters
    U_Password NVARCHAR(255)       -- Password, stored as a hashed value, up to 255 characters
);

CREATE TABLE S_CALLS (
    C_ID INT PRIMARY KEY,              -- Primary Key, unique identifier for each call
    StartTime DATETIME,                -- Start time of the call
    EndTime DATETIME,                  -- End time of the call
    Duration INT,                      -- Duration of the call in minutes
    C_Caller INT,                        -- Caller, references U_ID in USERS table
    C_Receiver INT,                      -- Receiver, references U_ID in USERS table
    Fees FLOAT                         -- Fees for the call
);

CREATE TABLE S_MESSAGES (
    M_ID INT PRIMARY KEY,              -- Primary Key, unique identifier for each message
    ReceivedTime DATETIME,             -- Time the message was received
    M_Length BIGINT,                   -- Length of the message (using BIGINT for long data type)
    M_Sender INT,                        -- Sender, can reference another table like USERS
    M_Receiver INT,                      -- Receiver, can reference another table like USERS
    Fees FLOAT                         -- Fees associated with the message
);

CREATE TABLE FEES(
	F_ID INT PRIMARY KEY,              -- Primary key, unique identifier for each type of fee
	CallFee FLOAT,                     -- Fee of call calculated on each minute
	MessageFee FLOAT                   -- Fee of message calculated on each character
);

ALTER TABLE S_CALLS
ADD CONSTRAINT FK_C_Caller FOREIGN KEY (C_Caller) REFERENCES USERS(U_ID),     -- Foreign key constraint on C_Caller
CONSTRAINT FK_C_Receiver FOREIGN KEY (C_Receiver) REFERENCES USERS(U_ID)      -- Foreign key constraint on C_Receiver

ALTER TABLE S_MESSAGES
ADD CONSTRAINT FK_M_Sender FOREIGN KEY (M_Sender) REFERENCES USERS(U_ID),     -- Foreign key constraint on M_Sender
CONSTRAINT FK_M_Receiver FOREIGN KEY (M_Receiver) REFERENCES USERS(U_ID)      -- Foreign key constraint on M_Receiver 

--Create some dummy data and test the connection between tables
INSERT INTO USERS (U_ID, U_Name, Email, PhoneNumber, U_Password)
VALUES
(1, 'Alice Johnson', 'alice.johnson@example.com', '1234567890', 'password123'),
(2, 'Bob Smith', 'bob.smith@example.com', '0987654321', 'password456'),
(3, 'Charlie Brown', 'charlie.brown@example.com', '5678901234', 'password789');

INSERT INTO S_CALLS (C_ID, StartTime, EndTime, Duration, C_Caller, C_Receiver, Fees)
VALUES
(1, '2024-10-01 10:00:00', '2024-10-01 10:30:00', 30, 1, 2, 5.00),
(2, '2024-10-02 14:00:00', '2024-10-02 14:10:00', 10, 2, 3, 2.00),
(3, '2024-10-03 16:15:00', '2024-10-03 16:45:00', 30, 3, 1, 4.50);

INSERT INTO S_MESSAGES (M_ID, ReceivedTime, M_Length, M_Sender, M_Receiver, Fees)
VALUES
(1, '2024-10-01 12:00:00', 150, 1, 2, 0.50),
(2, '2024-10-02 15:00:00', 300, 2, 3, 0.75),
(3, '2024-10-03 18:00:00', 200, 3, 1, 0.60);

--Check dummy data in each table
SELECT * FROM USERS
SELECT * FROM S_CALLS
SELECT * FROM S_MESSAGES

--Check the connection between tables
--Example: Show the sender name, received time, length and fees for all the messages received by 'Alice Johnson'
SELECT U_S.U_Name AS Sender_Name, FORMAT(M.ReceivedTime, 'dd/MM/yyyy HH:mm:ss') AS Received_Time, M.M_Length AS Message_Length, M.Fees 
FROM S_MESSAGES AS M 
JOIN USERS AS U_R ON U_R.U_ID = M.M_Receiver
JOIN USERS AS U_S ON U_S.U_ID = M.M_Sender
WHERE U_R.U_Name = 'Alice Johnson'