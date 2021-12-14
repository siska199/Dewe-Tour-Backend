'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

     await queryInterface.bulkInsert(
      'users',
      [
        {
          fullName: 'Siska Apriana Rifianti',
          email: 'admin@gmail.com',
          password:
            '$2b$10$YyKQSrtrLAei7SfOieL0V.htYu24UPbXqiEjI7vltbw4iSmMMS7Lq', //1117889999
          phone : '123456789',
          address: 'Jl. Gunung Kawi',
          status: 'admin',
          gender: 'Female',
          image: 'https://res.cloudinary.com/university-state-of-malang-city/image/upload/v1639396684/profile/profile_x0iats.jpg'
        },
      ],
      {}
    );


  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
