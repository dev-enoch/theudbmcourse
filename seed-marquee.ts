import 'dotenv/config';
import { updateSettings } from './src/lib/settings';

async function seedMarquee() {
  const marqueeText = "Welcome to The UBDM Course! Important: Don't forget to join our exclusive WhatsApp support group using the link in your course outline for guidance and updates.";
  
  try {
    await updateSettings({
      announcementEnabled: true,
      announcementBanner: marqueeText
    });
    console.log("Marquee seeded successfully!");
  } catch (error) {
    console.error("Failed to seed marquee:", error);
  }
  process.exit(0);
}

seedMarquee();
