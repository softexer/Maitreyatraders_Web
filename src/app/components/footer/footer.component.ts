import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
logoPath = '../../../assets/logo.png';

  // Company description
  companyDescription = 'Lorem ipsum dolor sit amet consectetur. Aenean malesuada tincidunt cursetur phasellus.';

  // Quick Links
  quickLinks = [
    { label: 'Home', url: '/home' },
    { label: 'About', url: '/about' },
    { label: 'Products', url: '/products' },
    { label: 'Recipes', url: '/recipes' },
    { label: 'Blog', url: '/blog' }
  ];

  // Contact Information
  contactInfo = {
    khNo: '763, Sirorspur, Badli, Delhi,',
    address: 'India - 110042',
    phone: '+91-0000000000',
    email: 'maitreyatraderslimited@gmail.com'
  };

  // Social Media Links (place social icons in assets folder)
  socialLinks = [
    { name: 'Instagram', icon: '../../../assets/insta.png', url: 'https://instagram.com' },
    { name: 'Facebook', icon: '../../../assets/fb.png', url: 'https://facebook.com' },
    { name: 'YouTube', icon: '../../../assets/youtube.png', url: 'https://youtube.com' }
  ];

  // Copyright text with current year
  copyrightText = `Maitreya Traders Copyright ${new Date().getFullYear()}. All Rights Reserved.`;
}
