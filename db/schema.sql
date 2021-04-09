--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE ftduser;
CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	email VARCHAR(78) NOT NULL, -- Why 78? See: https://tools.ietf.org/html/rfc6532, section 3.4
	firstName VARCHAR (20) NOT NULL,
	lastName VARCHAR (20) NOT NULL,
	score NUMERIC (20)
	
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'), 'user1@example1.com', 'user1name', 'someLastName', 0);
INSERT INTO ftduser VALUES('user2', sha512('password2'), 'user2@example2.com', 'user2name', 'anotherLastName', 0);
