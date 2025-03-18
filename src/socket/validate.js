const db = require('../config/db');
const User = require('../app/model/User');
module.exports = function(io, socket)
{
    // Lắng nghe sự kiện 'requestData' từ client
    socket.on('checkLogin', async ({username, password}) => {
      let err = null;
    try{
      let user = await User(db).findOne({ where: { phone: username } });
      if (!user)
          err = 'username'
      else {

          user = await User(db).findOne({ where: { phone: username, password: password } });

          if (!user)
              err = 'pass'
      }
          socket.emit('reciveError', err);
      

    }catch(err){
      console.error('Error fetching user:', err);
    }
    
  });
  socket.on('checkSignup', async ({ phone }) => {
    let err = null;
    if(phone)
    {
      try{
        let user = await User(db).findOne({ where: { phone: phone } });
        if (user)
            err = 'exist'

      }catch(error){
        console.error('Error fetching user:', err);
      }
    }

    socket.emit('reciveError', err);  
  })
};