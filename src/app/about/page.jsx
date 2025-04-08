import Navbar from "@/components/Navbar";
import Footer from "../../components/footer";
import Image from "next/image";

export default function AboutPage() {
  // Mock data for team members
  const teamMembers = [
    {
      id: 1,
      name: "Mahmud Tipu",
      position: "Lead Developer & Founder",
      bio: "Mahmud Tipu is the visionary behind our platform, leading the development team and overseeing the entire software architecture. With a strong background in full-stack development, he is passionate about building scalable and innovative solutions that address real-world challenges.",
      image: "/1687576195-Untitled design (3).png", // Updated path (no /public)
    },
    {
      id: 2,
      name: "Abul Monsur",
      position: "Frontend Developer",
      bio: "Monsur is a skilled frontend developer with a focus on creating intuitive and visually appealing user interfaces. He works closely with the design team to ensure that the platform's frontend is user-friendly, responsive, and optimized for a seamless user experience across all devices.",
      image: "/1735403911-abul monsur mohammad kachru.png", // Updated path (no /public)
    },
    {
      id: 3,
      name: "Mehrab Hossan",
      position: "Backend Developer",
      bio: "Mehrab Hossan is responsible for the backend development of the platform, focusing on building efficient and secure server-side logic. He works on optimizing performance, ensuring data integrity, and integrating complex systems that power the application’s core functionality.",
      image: "/1704651595988.jpeg", // Updated path (no /public)
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg mb-4">
              We're dedicated to creating comprehensive, easy-to-understand
              documentation for developers. Our platform helps bridge the gap
              between complex code and practical implementation.
            </p>
            <p className="text-lg">
              With years of experience in software development and technical
              writing, we understand the challenges developers face when working
              with new technologies.
            </p>
          </div>
          <div className="relative h-80 w-full">
            <Image
              src="https://www.adaptiveus.com/hubfs/124515-min.jpg"
              alt="Our team working together"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="relative h-48 w-full mb-4">
                  <Image
                    src={member.image || "/placeholder.svg"} // Fallback image if none is provided
                    alt={member.name}
                    layout="fill" // Make sure layout is set
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-gray-600 mb-2">{member.position}</p>
                <p className="text-gray-800">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Clarity</h3>
              <p>
                We believe in making complex concepts accessible through clear,
                concise documentation that anyone can understand.
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Thoroughness</h3>
              <p>
                Our documentation covers every aspect of a project, from setup
                to advanced features, ensuring no questions are left unanswered.
              </p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Practicality</h3>
              <p>
                We focus on real-world applications, providing examples and use
                cases that demonstrate how to implement features effectively.
              </p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p>
                We foster a supportive community where developers can share
                knowledge, ask questions, and collaborate on solutions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
