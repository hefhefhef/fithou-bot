import axios from 'axios';
import config from 'config';

export const sendReminder = async () => {
  console.log('sendReminder', new Date());
  await axios.post(config.jobs.attendanceReminder.webHookUrl, {
    cards: [
      {
        header: {
          title: 'Chấm công chưa?',
          subtitle: new Date().toLocaleString(),
          imageUrl:
            'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAdKYAJGgdIGqdaz1IYB-Nrlmi6SjzrqMDsI2igEWDZZoiOYfhIf1Eyf-Q7QTFLKugw0U&usqp=CAU',
          imageStyle: 'AVATAR',
        },
        sections: [
          {
            widgets: [
              {
                textParagraph: {
                  text: 'Chấm công đuy',
                },
              },
            ],
          },
        ],
      },
    ],
  });
};
