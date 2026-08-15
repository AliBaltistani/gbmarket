import React from 'react';
import SEO from '../components/SEO';

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 pb-16">
            <SEO
                title="Privacy Policy"
                description="Our privacy policy outlining how we handle and protect your personal information at GBMarket."
                canonical="https://gbmarket.pk/privacy"
            />

            <section className="bg-gradient-to-r from-[#F5EFE0] via-[#F5A623]/20 to-[#F5EFE0] border-b border-[#E8DEC8] py-12 px-4 text-center rounded-3xl mt-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#3A2E1F]">Privacy Policy</h1>
                <p className="text-sm text-[#3A2E1F]/70 mt-2">Last updated: August 2026</p>
            </section>

            <div className="bg-[#FFFDF9] border border-[#E8DEC8] rounded-3xl p-8 sm:p-12 space-y-6 shadow-sm text-sm text-[#3A2E1F]/80 leading-relaxed font-body">
                <h2 className="text-xl font-bold font-heading text-[#3A2E1F]">1. Introduction</h2>
                <p>GBMarket values your privacy and is committed to protecting your personal data. This Privacy Policy describes how we collect, use, and process your information when you visit our website or make a purchase.</p>

                <h2 className="text-xl font-bold font-heading text-[#3A2E1F]">2. Information We Collect</h2>
                <p>We may collect information such as your name, email address, shipping address, and phone number when you place an order, create an account, or contact our customer support.</p>

                <h2 className="text-xl font-bold font-heading text-[#3A2E1F]">3. Use of Your Information</h2>
                <p>Your information is used solely to process orders, deliver products, provide customer service, and communicate with you about your transaction.</p>

                <h2 className="text-xl font-bold font-heading text-[#3A2E1F]">4. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to ensure the security of your privacy and protect it against unauthorized access, loss, or misuse.</p>

                <h2 className="text-xl font-bold font-heading text-[#3A2E1F]">5. Third-Party Disclosures</h2>
                <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except trusted partners who assist us in operating our website, serving you, and delivering orders, provided that those parties agree to keep this information confidential.</p>

                <div className="pt-8 border-t border-[#E8DEC8]">
                    <p className="font-bold">Contact Us</p>
                    <p>If you have any questions regarding this Privacy Policy, please contact us at info@gbmarket.pk.</p>
                </div>
            </div>
        </div>
    );
}
