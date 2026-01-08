// Test ultra-simple - Une seule ligne !
// Copiez cette ligne dans la console :

localStorage.setItem('userToken','test');localStorage.setItem('userRole','user');localStorage.setItem('userData',JSON.stringify({id:'1',email:'user@test.com',role:'user',full_name:'Test User'}));['/dashboard','/test-results','/profile'].forEach(p=>{console.log(`Test: ${p}`);window.location.href=p;});

// Ou version lisible :
localStorage.setItem('userToken', 'test');
localStorage.setItem('userRole', 'user');
localStorage.setItem('userData', JSON.stringify({
  id: '1',
  email: 'user@test.com',
  role: 'user',
  full_name: 'Test User'
}));
['/dashboard', '/test-results', '/profile'].forEach(page => {
  console.log(`Test: ${page}`);
  window.location.href = page;
}); 