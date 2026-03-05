<!DOCTYPE html>
<html>
<head>
  <title>Skillfeed | Find People</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>

<header>
  <h1>Skillfeed</h1>

  <nav>
    <a href="/home.html">Home</a>
    <a href="/ideas.html">Ideas</a>
    <a href="/people.html">Find People</a>
    <a href="/messages.html">Messages</a>
    <a href="/profile.html">Profile</a>
    <a href="/create-profile.html">Create Profile</a>
    <button onclick="logout()">Logout</button>
  </nav>
</header>

<div class="main">
  <h2>Find People</h2>

  <div class="card" style="width: 380px;">
    <input id="searchInput" placeholder="Search by name / skill / location / interest">
    <button id="searchBtn">Search</button>
    <button id="clearBtn">Clear</button>
  </div>

  <div id="peopleList"></div>
</div>

<footer>Developed by Kshiprant</footer>

<script type="module" src="people.js"></script>
<script type="module" src="auth.js"></script>

</body>
</html>
