-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hireflow_db;
USE hireflow_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('job_seeker', 'recruiter') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Job Seekers Table
CREATE TABLE IF NOT EXISTS job_seekers (
  seeker_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skills TEXT,
  experience INT DEFAULT 0,
  resume_link VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Recruiters Table
CREATE TABLE IF NOT EXISTS recruiters (
  recruiter_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  job_id INT PRIMARY KEY AUTO_INCREMENT,
  recruiter_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  salary DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(recruiter_id) ON DELETE CASCADE
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  seeker_id INT NOT NULL,
  status ENUM('applied', 'shortlisted', 'rejected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (seeker_id) REFERENCES job_seekers(seeker_id) ON DELETE CASCADE
);

-- Sample Data Seeding
-- Insert Recruiters and Seekers (We'll do this to make testing easier)
-- Standard password hash for 'password123' using bcrypt (saltRounds=10): $2a$10$Q214C.q/J/U2m4Lh9T3J4eYpXmG98q520HpeK87c4f4K4Qo83d5nC
INSERT INTO users (user_id, name, email, password, role) VALUES
(1, 'TechCorp Recruiter', 'recruiter@techcorp.com', '$2a$10$Q214C.q/J/U2m4Lh9T3J4eYpXmG98q520HpeK87c4f4K4Qo83d5nC', 'recruiter'),
(2, 'Jane Doe Seeker', 'jane@seeker.com', '$2a$10$Q214C.q/J/U2m4Lh9T3J4eYpXmG98q520HpeK87c4f4K4Qo83d5nC', 'job_seeker'),
(3, 'GlobalSoft HR', 'hr@globalsoft.com', '$2a$10$Q214C.q/J/U2m4Lh9T3J4eYpXmG98q520HpeK87c4f4K4Qo83d5nC', 'recruiter');

INSERT INTO recruiters (recruiter_id, user_id, company_name) VALUES
(1, 1, 'TechCorp Solutions'),
(2, 3, 'GlobalSoft Inc.');

INSERT INTO job_seekers (seeker_id, user_id, skills, experience, resume_link) VALUES
(1, 2, 'JavaScript, React, Node.js, Express, MySQL', 3, 'https://drive.google.com/file/d/sample-resume/view');

INSERT INTO jobs (job_id, recruiter_id, title, description, location, salary) VALUES
(1, 1, 'Senior Software Engineer', 'We are looking for a Senior Software Engineer with expertise in Node.js and SQL to build high-scale APIs. Experience with cloud services is a plus.', 'Remote', 120000.00),
(2, 1, 'Frontend Developer', 'Join our design system team and help build beautiful component libraries using React and Tailwind CSS.', 'New York, NY', 95000.00),
(3, 2, 'Fullstack Web Developer', 'Seeking a versatile Fullstack developer proficient in React, Express, and Relational databases. You will work on greenfield SaaS projects.', 'San Francisco, CA', 110000.00);

INSERT INTO applications (application_id, job_id, seeker_id, status) VALUES
(1, 1, 1, 'applied');
