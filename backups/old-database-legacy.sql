--
-- PostgreSQL database dump
--

\restrict D1vYKtakE9hcSyvdoHTWffC9CoRnivwn276y4wDPwqMfBMkS53ye4tdZ507m94u

-- Dumped from database version 16.15 (Homebrew)
-- Dumped by pg_dump version 16.15 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."User" (id, name, email, password, phone, role, "createdAt", "updatedAt", "verificationStatus", "verifiedAt") FROM stdin;
cmtlmx8x80000nmxy9byu80kh	John Doe	john@example.com	$2b$12$SgGM4KhIE3fBxB4ckRES.uerjLRIqY.YivE9XM7BmUk72cH6RAi8a	08012345678	CUSTOMER	2026-09-03 14:43:10.316	2026-09-03 14:43:10.316	UNVERIFIED	\N
cmtmrhdpm00005uxyzji4iq4v	John Service Provider	john@serviceconnect.com	$2b$12$YKtyirtAR..v.2cusUurt.OwKtS7HUHb9DYJtWY5TWO4hl3qOAYT6	08012345678	PROVIDER	2026-09-04 09:38:34.282	2026-09-04 12:56:33.866	UNVERIFIED	\N
cmtn3jy2r0000vsxypz0y6br4	John Services	john.provider@example.com	$2b$12$DckzoXUw175jdjjg7fVSruU4IF8ytMv/v9KaC9.1bp8YmhEzfWq9W	08098765432	PROVIDER	2026-09-04 15:16:29.379	2026-09-04 15:16:29.379	UNVERIFIED	\N
cmtn68a8w0000ylxyxd5cwtej	Test Customer	customer@test.com	$2b$12$bOq.YWdYPOXQXF0Yj0arKebR.bX5lSFKylEFTJ8SPSKEmX6wHHRlu	08012345678	CUSTOMER	2026-09-04 16:31:24.128	2026-09-04 21:40:46.78	UNVERIFIED	\N
cmtq6hqwb00007uxy5b97cd22	tao	tao@gmail.com	$2b$12$rW34meJMZ6OpZMXQvkb6p.ytKzBTWSV0WzTUyRuP1YVLekx/THThm	09044553366	CUSTOMER	2026-09-06 19:02:04.139	2026-09-06 19:02:04.139	UNVERIFIED	\N
cmtq742h200017uxynstsnhv3	gbemi	gbemi@gmail.com	$2b$12$7LFWa3Nrh3ViIUr.2Tw1F.b4ryFUnF3C79emCsWqS07KLbLy/baFa	0903443354	CUSTOMER	2026-09-06 19:19:25.574	2026-09-06 19:19:25.574	UNVERIFIED	\N
cmtq764ob00027uxypl348tqj	khadijat Adedokun	khadijat@gmail.com	$2b$12$mvDZg8jhRmdZQ14k7nR14uik0PEaH.CUArm7PiQX0GFKAfiktW842	0902222233	PROVIDER	2026-09-06 19:21:01.739	2026-09-06 19:21:01.739	UNVERIFIED	\N
cmtqc9jt300037uxylwz42j4y	waheed oladunjoye	waheed.oladunjoye@etranzactng.com	$2b$12$a8qV7ceRNUizKUol79OJPOfGD6x9NA7CJ4fUInLh7QU26SWHNXH8u	09077665443	CUSTOMER	2026-09-06 21:43:39.399	2026-09-06 21:43:39.399	UNVERIFIED	\N
cmtqes1dc0000fbxyqq2dxf3z	gbemishola	gbemishola@gmail.com	$2b$12$YTU4M4Mna4yQ3oOZjZ0f2uy3lKBITKEw11rUdMB1JyQQm1W8KDKq6	090443554433	PROVIDER	2026-09-06 22:54:01.2	2026-09-06 22:54:01.2	UNVERIFIED	\N
cmtqy1xu10004fbxyrypdjl2i	kola lawal	naijateddy@yahoo.com	$2b$12$38syKDd6VJbrmHNhCy0DYeJI/ejpM8D/5c6aNxqXxpHIXSom8G9pi	08024063412	CUSTOMER	2026-09-07 07:53:35.881	2026-09-07 07:53:35.881	UNVERIFIED	\N
cmtr5wuv80006vixypy67tznk	Idayat Ajoke	idayatalaka27@gmail.com	$2b$12$mcWa.0RDxK5Sd809oB.VP..by2aCx24ILEdVz/Q0nOinV3ltxd4My	07049309625	CUSTOMER	2026-09-07 11:33:35.684	2026-09-07 11:33:35.684	UNVERIFIED	\N
cmtr64nrp0009vixytexxe1vp	daya	daya@gmail.com	$2b$12$lGacMxtuYLHFcpSbM26g7eto2Q2FqLFxXFcRK6TjRt6K1aewg7znK	09088776655	PROVIDER	2026-09-07 11:39:39.733	2026-09-07 11:39:39.733	UNVERIFIED	\N
cmtln533z0000q1xy98h2d0xc	Taofeeq Adeokun	feeq2022@gmail.com	$2b$12$zAOM8OPvEF0As8Ywqpzune70jd7rKvqdKJaRWq9XYIxya4sbo7lvG	07033729854	CUSTOMER	2026-09-03 14:49:16.031	2026-09-07 23:15:54.201	UNVERIFIED	\N
cmtsu9cdw0002shxy54kcuzvd	Adebukola Akinlade	bukronky@gmail.com	$2b$12$l2meFQtqRf.lID5GWbtr3O74B4lhopRqxgroIXKMnTXcyvs2HMFu6	07033443388	CUSTOMER	2026-09-08 15:42:55.22	2026-09-08 15:42:55.22	UNVERIFIED	\N
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."Service" (id, title, description, price, category, status, "providerId", "createdAt", "updatedAt") FROM stdin;
cmtn4hpl70000ftxyg7rm8sj5	Laptop Repair	Professional laptop repair, software installation and maintenance services.	15000.000000000000000000000000000000	Computer Services	ACTIVE	cmtn3jy2r0000vsxypz0y6br4	2026-09-04 15:42:44.683	2026-09-04 15:42:44.683
cmtmrjuu900015uxykmc3k0pj	Premium Website Development	Modern responsive websites for businesses and organizations.	300000.000000000000000000000000000000	Web Development	ACTIVE	cmtmrhdpm00005uxyzji4iq4v	2026-09-04 09:40:29.793	2026-09-04 23:33:05.615
cmtqeutum0001fbxyiv0x9wuu	Programming class	FullStack	1500000.000000000000000000000000000000	Software Dev	ACTIVE	cmtqes1dc0000fbxyqq2dxf3z	2026-09-06 22:56:11.422	2026-09-06 22:56:11.422
cmtqewocz0003fbxyoc0ichw2	Lecturing	Lecturer	300000.000000000000000000000000000000	Univesity	ACTIVE	cmtqes1dc0000fbxyqq2dxf3z	2026-09-06 22:57:37.619	2026-09-06 23:08:49.356
cmtqevqhl0002fbxyct3im21f	DevOps	Advance	200000.000000000000000000000000000000	troubleshooting	ACTIVE	cmtqes1dc0000fbxyqq2dxf3z	2026-09-06 22:56:53.721	2026-09-06 23:09:08.453
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."Order" (id, "customerId", "serviceId", amount, status, notes, "createdAt", "updatedAt", "customerApproved", "customerApprovedAt", "providerApproved", "providerApprovedAt", "providerAccepted", "providerAcceptedAt", "providerDeclineReason", "providerDeclinedAt", "closedAt", "completedAt", "paidAt", "scheduledAt", "startedAt") FROM stdin;
cmtncm2890001ylxy3trgz4t4	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	250000.000000000000000000000000000000	PENDING	I need this service as soon as possible.	2026-09-04 19:30:04.617	2026-09-04 19:30:04.617	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtndo3ao0000q6xyel0yag8m	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	250000.000000000000000000000000000000	COMPLETED	Please start this project as soon as possible.	2026-09-04 19:59:38.929	2026-09-04 20:49:06.323	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtnhmzap0000noxylp0n4nvi	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	250000.000000000000000000000000000000	PAID	Testing Paystack payment integration	2026-09-04 21:50:45.553	2026-09-04 22:25:13.764	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtnjy4pl0000gaxycvepue0n	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	250000.000000000000000000000000000000	COMPLETED	Testing Paystack webhook	2026-09-04 22:55:25.017	2026-09-04 23:04:45.754	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtnkme370000azxykte9dway	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	250000.000000000000000000000000000000	PENDING	Role guard test	2026-09-04 23:14:16.915	2026-09-04 23:14:16.915	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtqccb2300047uxyoyqs9d7o	cmtqc9jt300037uxylwz42j4y	cmtmrjuu900015uxykmc3k0pj	300000.000000000000000000000000000000	PENDING	\N	2026-09-06 21:45:48.028	2026-09-06 21:45:48.028	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtqdi36u0000u6xy6ary26ta	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	300000.000000000000000000000000000000	PAID	\N	2026-09-06 22:18:17.382	2026-09-06 22:33:41.925	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtqz4a0h0005fbxyv7ryac8s	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PAID	\N	2026-09-07 08:23:24.593	2026-09-07 10:39:28.303	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr40aps0009fbxyu6bdgiim	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-07 10:40:16.96	2026-09-07 10:40:16.96	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr41ju3000bfbxyz0rxrb7r	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-07 10:41:15.435	2026-09-07 10:41:15.435	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr4hagu0000vixyvxd5yzn3	cmtq742h200017uxynstsnhv3	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-07 10:53:29.791	2026-09-07 10:53:29.791	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr5j5bo0002vixy9v12rffl	cmtqc9jt300037uxylwz42j4y	cmtqeutum0001fbxyiv0x9wuu	1500000.000000000000000000000000000000	PENDING	\N	2026-09-07 11:22:56.052	2026-09-07 11:22:56.052	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr5ynb60007vixy7lhwnrna	cmtr5wuv80006vixypy67tznk	cmtqewocz0003fbxyoc0ichw2	300000.000000000000000000000000000000	PENDING	\N	2026-09-07 11:34:59.202	2026-09-07 11:34:59.202	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtrc341i000avixyzbojrt82	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	300000.000000000000000000000000000000	PENDING	\N	2026-09-07 14:26:25.206	2026-09-07 14:26:25.206	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtr5kzd90004vixyggwe82q3	cmtqc9jt300037uxylwz42j4y	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	COMPLETED	\N	2026-09-07 11:24:21.646	2026-09-07 22:20:39.963	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtsdyvvt0000l5xyc4sz7d4j	cmtln533z0000q1xy98h2d0xc	cmtmrjuu900015uxykmc3k0pj	300000.000000000000000000000000000000	PAID	\N	2026-09-08 08:06:53.418	2026-09-08 11:25:59.512	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtskqob90000shxyahf09q41	cmtln533z0000q1xy98h2d0xc	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PAID	\N	2026-09-08 11:16:27.669	2026-09-10 10:39:50.818	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
cmtrv0zrw0001fdxy4r56vt1h	cmtln533z0000q1xy98h2d0xc	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-07 23:16:39.068	2026-09-14 21:16:21.618	f	\N	f	\N	t	2026-09-14 21:16:21.607	\N	\N	\N	\N	\N	\N	\N
cmtve18qk00002mxyspjcn96i	cmtln533z0000q1xy98h2d0xc	cmtqewocz0003fbxyoc0ichw2	300000.000000000000000000000000000000	PENDING	\N	2026-09-10 10:32:01.916	2026-09-15 14:34:32.405	f	\N	f	\N	t	2026-09-15 14:34:32.396	\N	\N	\N	\N	\N	\N	\N
cmtsic54100004oxyr4uck3jd	cmtq742h200017uxynstsnhv3	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-08 10:09:10.369	2026-09-16 16:31:16.81	f	\N	f	\N	t	2026-09-16 16:31:16.797	\N	\N	\N	\N	\N	\N	\N
cmtr404gm0007fbxy1fach1fy	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	200000.000000000000000000000000000000	PENDING	\N	2026-09-07 10:40:08.854	2026-09-16 16:31:46.96	f	\N	f	\N	t	2026-09-16 16:31:46.959	\N	\N	\N	\N	\N	\N	\N
cmtsuapki0003shxyztfxaxew	cmtsu9cdw0002shxy54kcuzvd	cmtqeutum0001fbxyiv0x9wuu	1500000.000000000000000000000000000000	PENDING	\N	2026-09-08 15:43:58.962	2026-09-16 16:33:59.769	f	\N	f	\N	t	2026-09-16 16:33:59.768	\N	\N	\N	\N	\N	\N	\N
cmu4bslc60006zbxy576kex29	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	300000.000000000000000000000000000000	PENDING	\N	2026-09-16 16:39:14.694	2026-09-16 16:39:14.694	f	\N	f	\N	f	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."Notification" (id, "userId", "orderId", type, title, message, "isRead", "createdAt", "updatedAt") FROM stdin;
cmtve18qx00022mxyl9rbsyq9	cmtqes1dc0000fbxyqq2dxf3z	cmtve18qk00002mxyspjcn96i	NEW_ORDER	New order received	You have received a new order for "Lecturing".	f	2026-09-10 10:32:01.929	2026-09-10 10:32:01.929
cmtvebak100032mxyyovue0cl	cmtln533z0000q1xy98h2d0xc	cmtskqob90000shxyahf09q41	PAYMENT_SUCCESS	Payment successful	Your payment of ₦200,000.00 for "DevOps" was successful.	f	2026-09-10 10:39:50.833	2026-09-10 10:39:50.833
cmtvebak300042mxya6lx9vvd	cmtqes1dc0000fbxyqq2dxf3z	cmtskqob90000shxyahf09q41	PAYMENT_RECEIVED	Payment received	Payment of ₦200,000.00 has been received for "DevOps".	f	2026-09-10 10:39:50.835	2026-09-10 10:39:50.835
cmu1qt9fh00009sxyauga1an6	cmtln533z0000q1xy98h2d0xc	cmtrv0zrw0001fdxy4r56vt1h	PROVIDER_ACCEPTED	Provider accepted your request	The provider has accepted your request for "DevOps".	f	2026-09-14 21:16:21.629	2026-09-14 21:16:21.629
cmu2rwdb500008cxy4zml9trh	cmtln533z0000q1xy98h2d0xc	cmtve18qk00002mxyspjcn96i	PROVIDER_ACCEPTED	Provider accepted your request	The provider has accepted your request for "Lecturing".	f	2026-09-15 14:34:32.417	2026-09-15 14:34:32.417
cmu4bicma0000zbxy4idu1ush	cmtq742h200017uxynstsnhv3	cmtsic54100004oxyr4uck3jd	PROVIDER_ACCEPTED	Provider accepted your request	The provider has accepted your request for "DevOps".	f	2026-09-16 16:31:16.834	2026-09-16 16:31:16.834
cmu4bizv90002zbxy3d9b84pk	cmtqy1xu10004fbxyrypdjl2i	cmtr404gm0007fbxy1fach1fy	PROVIDER_ACCEPTED	Provider accepted your request	The provider has accepted your request for "DevOps".	f	2026-09-16 16:31:46.965	2026-09-16 16:31:46.965
cmu4blucd0004zbxyy5ip7jgr	cmtsu9cdw0002shxy54kcuzvd	cmtsuapki0003shxyztfxaxew	PROVIDER_ACCEPTED	Provider accepted your request	The provider has accepted your request for "Programming class".	f	2026-09-16 16:33:59.773	2026-09-16 16:33:59.773
cmu4bslch0008zbxykbc4o771	cmtmrhdpm00005uxyzji4iq4v	cmu4bslc60006zbxy576kex29	NEW_ORDER	New order received	You have received a new order for "Premium Website Development".	f	2026-09-16 16:39:14.705	2026-09-16 16:39:14.705
\.


--
-- Data for Name: OrderEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."OrderEvent" (id, "orderId", type, message, "createdAt") FROM stdin;
cmu4bicmk0001zbxy6ullrv47	cmtsic54100004oxyr4uck3jd	PROVIDER_APPROVED	Provider approved the completed order for "DevOps".	2026-09-16 16:31:16.844
cmu4bizvb0003zbxy8nmcuf02	cmtr404gm0007fbxy1fach1fy	PROVIDER_APPROVED	Provider approved the completed order for "DevOps".	2026-09-16 16:31:46.967
cmu4blucf0005zbxylyoaybfe	cmtsuapki0003shxyztfxaxew	PROVIDER_APPROVED	Provider approved the completed order for "Programming class".	2026-09-16 16:33:59.775
\.


--
-- Data for Name: PasswordResetToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."PasswordResetToken" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."Review" (id, rating, comment, "userId", "serviceId", "createdAt", "orderId") FROM stdin;
cmtnmcxve0000s5xy4spnncxc	5	Excellent service and very professional.	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	2026-09-05 00:02:55.226	\N
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."Transaction" (id, amount, "customerId", "serviceId", "createdAt", "updatedAt", "orderId", status, "paidAt", "paymentProvider", "paymentReference") FROM stdin;
cmtndo3ar0001q6xy4l3d292v	250000.000000000000000000000000000000	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	2026-09-04 19:59:38.929	2026-09-04 20:49:06.326	cmtndo3ao0000q6xyel0yag8m	SUCCESS	\N	\N	\N
cmtnhmzar0001noxy3paembwv	250000.000000000000000000000000000000	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	2026-09-04 21:50:45.553	2026-09-04 22:25:13.76	cmtnhmzap0000noxylp0n4nvi	SUCCESS	2026-09-04 22:18:01	PAYSTACK	SC-cmtnhmzap0000noxylp0n4nvi-1788560118979
cmtnjy4pn0001gaxyyw6d4tea	250000.000000000000000000000000000000	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	2026-09-04 22:55:25.017	2026-09-04 22:58:27.463	cmtnjy4pl0000gaxycvepue0n	SUCCESS	2026-09-04 22:58:25	PAYSTACK	SC-cmtnjy4pl0000gaxycvepue0n-1788562571736
cmtnkme390001azxy1sijw3xq	250000.000000000000000000000000000000	cmtn68a8w0000ylxyxd5cwtej	cmtmrjuu900015uxykmc3k0pj	2026-09-04 23:14:16.915	2026-09-04 23:14:16.915	cmtnkme370000azxykte9dway	PENDING	\N	\N	\N
cmtqccb2900057uxytszuoay4	300000.000000000000000000000000000000	cmtqc9jt300037uxylwz42j4y	cmtmrjuu900015uxykmc3k0pj	2026-09-06 21:45:48.028	2026-09-06 21:45:48.028	cmtqccb2300047uxyoyqs9d7o	PENDING	\N	\N	\N
cmtqdi36w0001u6xy268t0gkw	300000.000000000000000000000000000000	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	2026-09-06 22:18:17.382	2026-09-06 22:33:41.923	cmtqdi36u0000u6xy6ary26ta	SUCCESS	2026-09-06 22:33:40	PAYSTACK	SC-cmtqdi36u0000u6xy6ary26ta-1788734007378
cmtqz4a0l0006fbxy7nhpfars	200000.000000000000000000000000000000	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	2026-09-07 08:23:24.593	2026-09-07 10:39:28.3	cmtqz4a0h0005fbxyv7ryac8s	SUCCESS	2026-09-07 10:39:27	PAYSTACK	SC-cmtqz4a0h0005fbxyv7ryac8s-1788777558492
cmtr404go0008fbxy7bwpvbxc	200000.000000000000000000000000000000	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	2026-09-07 10:40:08.854	2026-09-07 10:40:08.854	cmtr404gm0007fbxy1fach1fy	PENDING	\N	\N	\N
cmtr40apt000afbxyf09ffew0	200000.000000000000000000000000000000	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	2026-09-07 10:40:16.96	2026-09-07 10:40:16.96	cmtr40aps0009fbxyu6bdgiim	PENDING	\N	\N	\N
cmtr41ju4000cfbxyieopabso	200000.000000000000000000000000000000	cmtqy1xu10004fbxyrypdjl2i	cmtqevqhl0002fbxyct3im21f	2026-09-07 10:41:15.435	2026-09-07 10:41:15.435	cmtr41ju3000bfbxyz0rxrb7r	PENDING	\N	\N	\N
cmtr5j5bq0003vixy5zf7asrc	1500000.000000000000000000000000000000	cmtqc9jt300037uxylwz42j4y	cmtqeutum0001fbxyiv0x9wuu	2026-09-07 11:22:56.052	2026-09-07 11:23:05.176	cmtr5j5bo0002vixy9v12rffl	PENDING	\N	PAYSTACK	SC-cmtr5j5bo0002vixy9v12rffl-1788780182861
cmtr5kzdb0005vixyyqlwjgtu	200000.000000000000000000000000000000	cmtqc9jt300037uxylwz42j4y	cmtqevqhl0002fbxyct3im21f	2026-09-07 11:24:21.646	2026-09-07 11:24:32.351	cmtr5kzd90004vixyggwe82q3	SUCCESS	2026-09-07 11:24:30	PAYSTACK	SC-cmtr5kzd90004vixyggwe82q3-1788780263596
cmtr5ynb70008vixy5zz1fp2y	300000.000000000000000000000000000000	cmtr5wuv80006vixypy67tznk	cmtqewocz0003fbxyoc0ichw2	2026-09-07 11:34:59.202	2026-09-07 11:35:55.359	cmtr5ynb60007vixy7lhwnrna	PENDING	\N	PAYSTACK	SC-cmtr5ynb60007vixy7lhwnrna-1788780951635
cmtrc341l000bvixygcjbze7b	300000.000000000000000000000000000000	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	2026-09-07 14:26:25.206	2026-09-07 14:26:25.206	cmtrc341i000avixyzbojrt82	PENDING	\N	\N	\N
cmtr4hagw0001vixyq6vwq24v	200000.000000000000000000000000000000	cmtq742h200017uxynstsnhv3	cmtqevqhl0002fbxyct3im21f	2026-09-07 10:53:29.791	2026-09-07 22:38:41.568	cmtr4hagu0000vixyvxd5yzn3	PENDING	\N	PAYSTACK	SC-cmtr4hagu0000vixyvxd5yzn3-1788820720733
cmtsic54600014oxyepcm9xgm	200000.000000000000000000000000000000	cmtq742h200017uxynstsnhv3	cmtqevqhl0002fbxyct3im21f	2026-09-08 10:09:10.369	2026-09-08 10:09:10.369	cmtsic54100004oxyr4uck3jd	PENDING	\N	\N	\N
cmtsdyvvx0001l5xyc7i8sczl	300000.000000000000000000000000000000	cmtln533z0000q1xy98h2d0xc	cmtmrjuu900015uxykmc3k0pj	2026-09-08 08:06:53.418	2026-09-08 11:25:59.51	cmtsdyvvt0000l5xyc4sz7d4j	SUCCESS	2026-09-08 11:25:57	PAYSTACK	SC-cmtsdyvvt0000l5xyc4sz7d4j-1788866740145
cmtsuapkk0004shxyrwdh7tt4	1500000.000000000000000000000000000000	cmtsu9cdw0002shxy54kcuzvd	cmtqeutum0001fbxyiv0x9wuu	2026-09-08 15:43:58.962	2026-09-08 15:43:58.962	cmtsuapki0003shxyztfxaxew	PENDING	\N	\N	\N
cmtrv0zrz0002fdxyiw8a43vd	200000.000000000000000000000000000000	cmtln533z0000q1xy98h2d0xc	cmtqevqhl0002fbxyct3im21f	2026-09-07 23:16:39.068	2026-09-09 10:46:13.82	cmtrv0zrw0001fdxy4r56vt1h	PENDING	\N	PAYSTACK	SC-cmtrv0zrw0001fdxy4r56vt1h-1788950755278
cmtve18qr00012mxyxjxt3k2r	300000.000000000000000000000000000000	cmtln533z0000q1xy98h2d0xc	cmtqewocz0003fbxyoc0ichw2	2026-09-10 10:32:01.916	2026-09-10 10:32:01.916	cmtve18qk00002mxyspjcn96i	PENDING	\N	\N	\N
cmtskqoba0001shxygfqojpkk	200000.000000000000000000000000000000	cmtln533z0000q1xy98h2d0xc	cmtqevqhl0002fbxyct3im21f	2026-09-08 11:16:27.669	2026-09-10 10:39:50.815	cmtskqob90000shxyahf09q41	SUCCESS	2026-09-10 10:39:48	PAYSTACK	SC-cmtskqob90000shxyahf09q41-1789036743775
cmu4bslca0007zbxyvf4xhng6	300000.000000000000000000000000000000	cmtq742h200017uxynstsnhv3	cmtmrjuu900015uxykmc3k0pj	2026-09-16 16:39:14.694	2026-09-16 16:39:14.694	cmu4bslc60006zbxy576kex29	PENDING	\N	\N	\N
\.


--
-- Data for Name: VerificationRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy."VerificationRequest" (id, "userId", status, "submittedAt", "reviewedAt", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY legacy._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
7d109f64-a0eb-4b39-b27e-ce0c15cd37ad	023c5c0a55bee8303686ad29884cd50c99432cf6dcf565c2a1e725f03e2a81ff	2026-09-03 13:42:59.084201+01	20260903124259_init	\N	\N	2026-09-03 13:42:59.055795+01	1
dec43d37-3e4a-457b-9636-d6d6143dd29e	8e8c0b5aabc68aaa95bd5c06c59a295a3d671267c3d9cdc393188f335564eda5	2026-09-04 11:24:45.024347+01	20260904102445_add_bookings	\N	\N	2026-09-04 11:24:45.013949+01	1
9321847f-6775-454e-99fb-6c2263e3387c	af71ea198a6a7e0b27d10e148b36e0b31b400a9c38d914f594063a13c035950c	2026-09-15 18:05:09.428594+01	20260915170509_add_order_events	\N	\N	2026-09-15 18:05:09.417608+01	1
4b95cad4-5a40-4863-8389-6721ac67419a	c0eeacfb9f88e293e2768f24f78fe4b822ac04c2baa64cf40eb53fc450f652e0	2026-09-04 16:49:53.806111+01	20260904154953_add_orders_transactions	\N	\N	2026-09-04 16:49:53.786605+01	1
6a6fe236-19c5-49de-a639-f28c4a514542	514fd878b024f6666381df2622049d70185270853741ff5c8da0496b24074d9f	2026-09-04 22:55:29.434942+01	20260904215529_add_payment_details	\N	\N	2026-09-04 22:55:29.427728+01	1
13d29377-457c-49ae-8210-857d25305985	67f11546e36ef3bbce3318aaee3b6551e32d350b17fad8ad40e0d0842b25318e	2026-09-07 23:56:14.852121+01	20260907225614_add_password_reset_tokens	\N	\N	2026-09-07 23:56:14.837379+01	1
ff6cb936-8ddb-4dea-9892-8541432551a9	98347e050a9812709111a6e852eadf22c5e3a099a275dc8ae155d1c9974d1fc5	2026-09-08 12:36:09.276674+01	20260908113609_add_notifications	\N	\N	2026-09-08 12:36:09.260358+01	1
5ac87f57-0bc3-4f59-95e4-6166621fe97e	aeb3ea579a7b15b781d7d9ee72ec6856e042cf509f18db31bd6086aa327fcf50	2026-09-09 15:44:26.305035+01	20260909144426_add_order_approvals	\N	\N	2026-09-09 15:44:26.299592+01	1
21cb4290-562b-472e-8808-91d8d066281c	d418c8f48c7e79c006bd06ce7c7691d32496d59fce651a7d9af4d971c0f00e7d	2026-09-10 11:53:05.003485+01	20260910105304_add_provider_acceptance	\N	\N	2026-09-10 11:53:04.998516+01	1
a2fbaaa8-7c06-41b0-8503-ab469bf4310d	6d9868dc316d35d82b7e9d67b3bb3e9f9b800e0d97ec7b19ad7ac6298e365be6	2026-09-14 21:20:36.136922+01	20260914202036_add_review_order_relation	\N	\N	2026-09-14 21:20:36.130999+01	1
a96104f8-db0d-4869-a60f-f30151f13495	7599a116251964e5f79c6b4528dac51bc4d104d5093802b34b7f14bb280a3620	2026-09-14 22:26:52.773234+01	20260914212652_add_provider_decline	\N	\N	2026-09-14 22:26:52.769652+01	1
aefe168c-1c73-4cba-a285-e355784ec274	92a3d49b05bc054878422b6aa61598c593ab31108156b29a2c01147403305700	2026-09-15 16:11:57.708044+01	20260915151157_add_order_lifecycle_dates	\N	\N	2026-09-15 16:11:57.704728+01	1
52a516d5-0b09-49e3-9714-dc02ea070127	aeebdb5aa46842bde7fbac640ae7f55d0f82a5ff7b394f7fef2431aa714aec77	2026-09-15 17:29:36.447835+01	20260915162936_add_user_verification	\N	\N	2026-09-15 17:29:36.444158+01	1
30a4ace5-cdf0-4567-abf0-80204ca41192	4c7b427f78ef6ad1577c93bda2a4a755c530a394456edf024d13662fe10a1ff4	2026-09-15 17:32:55.689778+01	20260915163255_add_verification_requests	\N	\N	2026-09-15 17:32:55.681175+01	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict D1vYKtakE9hcSyvdoHTWffC9CoRnivwn276y4wDPwqMfBMkS53ye4tdZ507m94u

