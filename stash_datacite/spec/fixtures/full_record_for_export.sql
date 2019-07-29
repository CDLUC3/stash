-- Please put two blank lines in between separate MySQL queries, because this is kind of a hack to get data in quickly just for this one test


INSERT INTO `stash_engine_identifiers` (`id`, `identifier`, `identifier_type`, `storage_size`, `created_at`, `updated_at`)
VALUES
(327, '10.7272/Q6RX997G', 'DOI', 5168709, '2017-08-22 19:34:58', '2017-09-12 22:06:42');


INSERT INTO `stash_engine_users` (`id`, `first_name`, `last_name`, `email`, `uid`, `provider`, `oauth_token`, `created_at`, `updated_at`, `tenant_id`, `last_login`, `role`, `orcid`)
VALUES
(299, 'Sergio', 'Baranzini', 'sebaran@cgl.ucsf.edu', '087193@ucsf.edu', 'shibboleth', NULL, '2017-08-21 17:55:34', '2019-03-14 18:12:12', 'ucsf', '2019-03-14 18:12:12', 'user', '0000-0003-0067-194X');


INSERT INTO `stash_engine_resources` (`id`, `user_id`, `current_resource_state_id`, `created_at`, `updated_at`, `has_geolocation`, `download_uri`, `identifier_id`, `update_uri`, `title`, `current_editor_id`, `publication_date`, `accepted_agreement`, `tenant_id`)
VALUES
(494, 299, 886, '2017-08-21 17:55:41', '2017-10-25 00:04:34', 1, 'http://merritt.cdlib.org/d/ark%3A%2Fb7272%2Fq6rx997g', 327, 'http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/edit/ucsf_lib_datashare/doi%3A10.7272%2FQ6RX997G', 'Gut Microbiota from Multiple Sclerosis patients triggers spontaneous autoimmune encephalomyelitis in mice --16S data--', 299, '2017-10-02 07:00:00', NULL, 'ucsf'),
(519, 299, 911, '2017-08-30 21:39:35', '2017-10-25 00:04:39', 1, 'http://merritt.cdlib.org/d/ark%3A%2Fb7272%2Fq6rx997g', 327, 'http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/edit/ucsf_lib_datashare/doi%3A10.7272%2FQ6RX997G', 'Gut Microbiota from Multiple Sclerosis patients triggers spontaneous autoimmune encephalomyelitis in mice --16S data--', 299, '2017-10-02 07:00:00', NULL, 'ucsf');


INSERT INTO `stash_engine_authors` (`id`, `author_first_name`, `author_last_name`, `author_email`, `author_orcid`, `resource_id`, `created_at`, `updated_at`)
VALUES
(989, 'Hartmut', 'Wekerle', 'hwekerle@neuro.mpg.de', NULL, 494, '2017-08-21 17:55:41', '2017-08-22 19:32:16'),
(1030, 'Sergio', 'Baranzini', 'sergio.baranzini@ucsf.edu', '0000-0003-0067-194X', 494, '2017-08-22 19:33:12', '2017-08-22 19:34:17'),
(1080, 'Hartmut', 'Wekerle', 'hwekerle@neuro.mpg.de', NULL, 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35'),
(1082, 'Kerstin', 'Berer', '', NULL, 519, '2017-08-30 21:39:51', '2017-08-30 21:39:53'),
(1083, 'Lisa Ann', 'Gerdes', '', NULL, 519, '2017-08-30 21:40:15', '2017-08-30 21:40:18'),
(1084, 'Egle', 'Cekanaviciute', '', NULL, 519, '2017-08-30 21:40:34', '2017-08-30 21:40:47'),
(1085, 'Sherman', 'Jia', '', NULL, 519, '2017-08-30 21:40:51', '2017-08-30 21:40:52'),
(1086, 'Liang', 'Xiao', '', NULL, 519, '2017-08-30 21:41:43', '2017-08-30 21:41:45'),
(1087, 'Zhongkui', 'Xia', '', NULL, 519, '2017-08-30 21:41:58', '2017-08-30 21:41:59'),
(1088, 'Chuan', 'Liu', '', NULL, 519, '2017-08-30 21:42:07', '2017-08-30 21:42:09'),
(1089, 'Luisa', 'Klotz', '', NULL, 519, '2017-08-30 21:42:19', '2017-08-30 21:42:22'),
(1090, 'Uta', 'Stauffer', '', NULL, 519, '2017-08-30 21:42:49', '2017-08-30 21:43:04'),
(1091, 'Sergio', 'Baranzini', NULL, '0000-0003-0067-194X', 519, '2017-08-30 21:43:11', '2017-08-30 21:43:11'),
(1092, 'Tania', 'Kümpfel', '', NULL, 519, '2017-08-30 21:43:20', '2017-08-30 21:43:35'),
(1093, 'Reinhard', 'Hohlfeld', '', NULL, 519, '2017-08-30 21:43:53', '2017-08-30 21:43:56'),
(1094, 'Gurumoorthy', 'Krishnamoorthy', '', NULL, 519, '2017-08-30 21:44:15', '2017-08-30 21:44:15');


INSERT INTO `stash_engine_edit_histories` (`id`, `resource_id`, `user_comment`, `created_at`, `updated_at`)
VALUES
(19, 494, NULL, '2017-08-22 19:34:57', '2017-08-22 19:34:57'),
(28, 519, NULL, '2017-08-30 21:45:22', '2017-08-30 21:45:22');


INSERT INTO `stash_engine_embargoes` (`id`, `end_date`, `resource_id`, `created_at`, `updated_at`)
VALUES
(19, '2017-10-02 07:00:00', 494, '2017-08-21 18:49:39', '2017-08-22 19:34:54'),
(25, '2017-10-02 07:00:00', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `stash_engine_file_uploads` (`id`, `upload_file_name`, `upload_content_type`, `upload_file_size`, `resource_id`, `upload_updated_at`, `created_at`, `updated_at`, `temp_file_path`, `file_state`, `url`, `status_code`, `timed_out`, `original_url`, `cloud_service`)
VALUES
(25196, X'4D61785F506C616E636B5F5477696E5F6D657461646174612E747874', 'text/plain', 4617, 494, '2017-08-21 19:18:52', '2017-08-21 19:18:52', '2017-08-21 19:18:52', X'2F617070732F64617368322F617070732F75692F72656C65617365732F32303137303831383030313131312F75706C6F6164732F3439342F4D61785F506C616E636B5F5477696E5F6D657461646174612E747874', 'created', NULL, NULL, 0, NULL, NULL),
(25197, X'4D61785F506C616E636B5F5477696E5F4F54555F7461626C652E747874', 'text/plain', 5092912, 494, '2017-08-21 19:18:58', '2017-08-21 19:18:58', '2017-08-21 19:18:58', X'2F617070732F64617368322F617070732F75692F72656C65617365732F32303137303831383030313131312F75706C6F6164732F3439342F4D61785F506C616E636B5F5477696E5F4F54555F7461626C652E747874', 'created', NULL, NULL, 0, NULL, NULL),
(26354, X'4D61785F506C616E636B5F5477696E5F6D657461646174612E747874', 'text/plain', 4617, 519, '2017-08-21 19:18:52', '2017-08-30 21:39:35', '2017-08-30 21:39:35', X'2F617070732F64617368322F617070732F75692F72656C65617365732F32303137303831383030313131312F75706C6F6164732F3439342F4D61785F506C616E636B5F5477696E5F6D657461646174612E747874', 'copied', NULL, NULL, 0, NULL, NULL),
(26355, X'4D61785F506C616E636B5F5477696E5F4F54555F7461626C652E747874', 'text/plain', 5092912, 519, '2017-08-21 19:18:58', '2017-08-30 21:39:35', '2017-08-30 21:39:35', X'2F617070732F64617368322F617070732F75692F72656C65617365732F32303137303831383030313131312F75706C6F6164732F3439342F4D61785F506C616E636B5F5477696E5F4F54555F7461626C652E747874', 'copied', NULL, NULL, 0, NULL, NULL);


INSERT INTO `stash_engine_resource_states` (`id`, `user_id`, `resource_state`, `created_at`, `updated_at`, `resource_id`)
VALUES
(886, 299, 'submitted', '2017-08-21 17:55:41', '2017-08-22 19:40:02', 494),
(911, 299, 'submitted', '2017-08-30 21:39:35', '2017-08-30 21:50:03', 519);


INSERT INTO `stash_engine_shares` (`id`, `secret_id`, `resource_id`, `created_at`, `updated_at`)
VALUES
(5, '5ATYuvmjECMr12HdycK9BJ4m5HibQuZsRGQwlBj_BBI', 494, '2017-08-23 01:10:22', '2017-08-23 01:10:22');


INSERT INTO `stash_engine_submission_logs` (`id`, `resource_id`, `archive_response`, `created_at`, `updated_at`, `archive_submission_request`)
VALUES
(126, 494, 'Success', '2017-08-22 19:35:08', '2017-08-22 19:35:08', 'Stash::Merritt::SubmissionJob for resource 494 (): posting new object to http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/collection/ucsf_lib_datashare (tenant: ucsf)'),
(135, 519, 'Success', '2017-08-30 21:45:28', '2017-08-30 21:45:28', 'Stash::Merritt::SubmissionJob for resource 519 (doi:10.7272/Q6RX997G): posting update to http://uc3-mrtsword-prd.cdlib.org:39001/mrtsword/edit/ucsf_lib_datashare/doi%3A10.7272%2FQ6RX997G (tenant: ucsf)');


INSERT INTO `stash_engine_versions` (`id`, `version`, `zip_filename`, `resource_id`, `created_at`, `updated_at`, `merritt_version`)
VALUES
(486, 1, '494_archive.zip', 494, '2017-08-21 17:55:41', '2017-08-22 19:35:08', 1),
(511, 2, '519_archive.zip', 519, '2017-08-30 21:39:35', '2017-08-30 21:45:28', 2);


INSERT INTO `dcs_affiliations` (`id`, `short_name`, `long_name`, `abbreviation`, `created_at`, `updated_at`)
VALUES
(84, NULL, 'Max Planck Institute of Neurobiology', NULL, '2017-08-21 18:01:06', '2017-08-21 18:01:06'),
(85, NULL, 'University of California San Francisco', NULL, '2017-08-21 18:02:42', '2017-08-21 18:02:42'),
(86, NULL, 'Ludwig-Maximillians University', NULL, '2017-08-21 18:04:55', '2017-08-21 18:04:55'),
(91, NULL, 'BGI-Shenzhen', NULL, '2017-08-30 21:33:14', '2017-08-30 21:33:14'),
(92, NULL, 'University Hospital Münster, Münster', NULL, '2017-08-30 21:34:20', '2017-08-30 21:34:20'),
(94, NULL, 'Max Planck Institute of Immunobiology and Epigenetics', NULL, '2017-08-30 21:36:02', '2017-08-30 21:36:02');


INSERT INTO `dcs_affiliations_authors` (`id`, `affiliation_id`, `author_id`, `created_at`, `updated_at`)
VALUES
(2895, 84, 989, '2017-08-22 19:32:16', '2017-08-22 19:32:16'),
(2898, 85, 1030, '2017-08-22 19:34:17', '2017-08-22 19:34:17'),
(3199, 84, 1080, '2017-08-30 21:44:45', '2017-08-30 21:44:45'),
(3164, 84, 1082, '2017-08-30 21:39:58', '2017-08-30 21:39:58'),
(3166, 86, 1083, '2017-08-30 21:40:23', '2017-08-30 21:40:23'),
(3168, 85, 1084, '2017-08-30 21:40:47', '2017-08-30 21:40:47'),
(3170, 85, 1085, '2017-08-30 21:41:38', '2017-08-30 21:41:38'),
(3172, 91, 1086, '2017-08-30 21:41:51', '2017-08-30 21:41:51'),
(3174, 91, 1087, '2017-08-30 21:42:03', '2017-08-30 21:42:03'),
(3176, 91, 1088, '2017-08-30 21:42:15', '2017-08-30 21:42:15'),
(3178, 92, 1089, '2017-08-30 21:42:45', '2017-08-30 21:42:45'),
(3225, 94, 1090, '2017-08-30 21:44:48', '2017-08-30 21:44:48'),
(3226, 94, 1090, '2017-08-30 21:44:48', '2017-08-30 21:44:48'),
(3182, 86, 1092, '2017-08-30 21:43:43', '2017-08-30 21:43:43'),
(3184, 86, 1093, '2017-08-30 21:44:02', '2017-08-30 21:44:02'),
(3185, 84, 1094, '2017-08-30 21:44:15', '2017-08-30 21:44:15');


INSERT INTO `dcs_contributors` (`id`, `contributor_name`, `contributor_type`, `name_identifier_id`, `resource_id`, `created_at`, `updated_at`, `award_number`)
VALUES
(382, 'Max-Planck-Gesellschaft', 'funder', NULL, 494, '2017-08-21 18:08:58', '2017-08-21 18:09:04', 'SFB TR-128'),
(383, 'German Competence Network on Multiple Sclerosis', 'funder', NULL, 494, '2017-08-21 18:09:14', '2017-08-21 18:09:14', ''),
(384, 'Max Planck Society', 'funder', NULL, 494, '2017-08-21 18:09:35', '2017-08-21 18:09:35', ''),
(434, 'Max-Planck-Gesellschaft', 'funder', NULL, 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35', 'SFB TR-128'),
(435, 'German Competence Network on Multiple Sclerosis', 'funder', NULL, 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35', ''),
(436, 'Max Planck Society', 'funder', NULL, 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35', '');


INSERT INTO `dcs_dates` (`id`, `date`, `date_type`, `resource_id`, `created_at`, `updated_at`)
VALUES
(369, '2017-10-02T07:00:00Z', 'available', 494, '2017-08-22 19:34:57', '2017-08-22 19:34:57'),
(382, '2017-10-02T07:00:00Z', 'available', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_descriptions` (`id`, `description`, `description_type`, `resource_id`, `created_at`, `updated_at`)
VALUES
(1069, '<p>The commensal microbiota has emerged as a key factor influencing human health and has been associated with several diseases, including those of the central nervous system (CNS). To investigate the role of the microbiome in multiple sclerosis (MS), a complex autoimmune disorder shaped by a multitude of genetic and environmental factors, we recruited a cohort of 34 monozygotic twin pairs discordant for MS, and compared their gut microbial composition by 16S ribosomal RNA sequencing of stool samples. While no major differences in the microbial profiles between MS-affected twins and their healthy co-twins were detected, a significant increase in some taxa (including Akkermansia) was seen in affected untreated subjects. To search for possible functional differences, we used a transgenic mouse model, in which spontaneous anti-CNS autoimmunity is dependent on the commensal gut flora. Germ-free mice colonized with microbiota from MS-affected twins, developed the MS-like disease with a significantly higher incidence than mice colonized with healthy twin-derived microbiota. Although alpha diversity was reduced compared to human donors, the microbial profiles of the colonized mice showed high intraindividual, remarkable temporal stability and a high transfer rate,. Analysis of the transplanted mouse microbiome at the level of individual taxa revealed several differences, including a significantly reduced abundance of the potentially autoimmune-protective genus Sutterella in mice colonized with MS-twin-derived microbiota. These findings provide first evidence that MS-derived microbiota contain factors that precipitate an MS-like autoimmune disease in a transgenic mouse model. This model lends itself to identify protective and pathogenic microbial component in human MS. </p>', 'abstract', 494, '2017-08-21 17:55:42', '2017-10-25 00:04:34'),
(1070, '<p>Study design. </p><p>MZ twins were recruited by launching a national televised appeal as well as internet notification in Germany with support from the German Multiple Sclerosis Society (DMSG). Inclusion criteria for study participation were met for MZ twins with an MS diagnosis according to the revised McDonald criteria or clinically isolated syndrome (CIS) in one twin only. Exclusion criteria were antibiotic, glucocorticosteroidal or immunosuppressive treatment, gastrointestinal infection or diet irregularities in the 3 months prior to study entry. In total, 34 pairs (see Table 1) visited the outpatient department at the Institute of Clinical Neuroimmunology in Munich for a detailed interview on past and present medical, family and social history, a neurological examination as well as a nutrition questionnaire. To confirm the MS diagnosis, medical records including MRI scans were obtained and reviewed. Fecal samples were either directly collected in hospital or taken at home, stored at -20°C and transferred to the hospital in cooling bags. Finally, all samples were stored at -80°C. Of all participants buccal swabs for zygosity testing were taken. The study was approved by the local Ethics Committee of the Ludwig-Maximilians University Munich and all participants gave written informed consent. </p><p>16S rRNA Sequencing and Analysis.</p><p>The V3-V5 region of bacterial 16S rRNA gene was amplified using the universal forward (5’-CCGTCAATTCMTTTGAGTTT-3’) and reverse primer (5’-ACTCCTA CGGGAGGCAGCAG-3’) incorporating the FLX Titanium adapters and a unique barcode sequence. PCR products were sequenced on a 454 GS FLX titanium pyrosequencer (454 Life Sciences, Branford, CT, USA) at BGI-Shenzhen. Analysis was performed using QIIME v1.9 as described (1). Essentially, amplicon sequences were quality-filtered and grouped to operational taxonomic units (OTUs) using SortMeRNA method (2) using GreenGenes version 13.8 97% dataset for closed reference. Sequences that did not match reference sequences in the GreenGenes database were dropped from the analysis. Taxonomy was assigned to the retained OTUs based on the GreenGenes reference sequence and the GreenGenes tree was used for all downstream phylogenetic community comparisons. Samples were filtered to at least 10000 sequences per sample and OTUs were filtered to retain only OTUs present in at least 5% of samples, covering at least 0.01% of total reads. After filtering, human samples were rarefied to 10975 sequences, while mouse samples were rarefied to 8137 sequences per sample, which were the lowest number of sequences per sample, respectively. For comparison between human and mouse samples, the human and mouse datasets were combined before OTU filtering and rarefaction. The resulting OTUs were filtered as described above and samples were rarefied to 6200 sequences per sample. Alpha diversity was calculated using phylogenetic diversity index method (3). For analysis of beta diversity, pairwise distance matrices were generated by phylogenetic metric of weighted UniFrac (4) and used for PCoA. For comparison of individual taxa, samples were not rarefied. Instead, OTU abundances were normalized using variance-stabilizing transformation and taxa distributions were compared using the Wald negative binomial test from the R software package DESeq2 (as described in (4, 5) with Benjamini-Hochberg correction for multiple comparisons. All statistical analyses of differences between individual bacterial species were performed using QIIME v.1.9 or R (packages DESeq2 and phyloseq). </p>', 'methods', 494, '2017-08-21 17:55:42', '2017-10-25 00:04:34'),
(1071, '<p>Two files are uploaded. The dataset contains both human and mice samples. </p><p>Max_Planck_Twin_metadata.txt: Contains the sample metadata</p><p>Max_Planck_Twin_OTU_table.txt: contains the normalized OTU abundances for each individual</p><p>OTU abundances were normalized using variance-stabilizing transformation and taxa distributions were compared using the Wald negative binomial test from the R software package DESeq2 (as described in (4, 5) with Benjamini-Hochberg correction for multiple comparisons.</p>', 'other', 494, '2017-08-21 17:55:42', '2017-10-25 00:04:34'),
(1144, '<p>The commensal microbiota has emerged as a key factor influencing human health and has been associated with several diseases, including those of the central nervous system (CNS). To investigate the role of the microbiome in multiple sclerosis (MS), a complex autoimmune disorder shaped by a multitude of genetic and environmental factors, we recruited a cohort of 34 monozygotic twin pairs discordant for MS, and compared their gut microbial composition by 16S ribosomal RNA sequencing of stool samples. While no major differences in the microbial profiles between MS-affected twins and their healthy co-twins were detected, a significant increase in some taxa (including Akkermansia) was seen in affected untreated subjects. To search for possible functional differences, we used a transgenic mouse model, in which spontaneous anti-CNS autoimmunity is dependent on the commensal gut flora. Germ-free mice colonized with microbiota from MS-affected twins, developed the MS-like disease with a significantly higher incidence than mice colonized with healthy twin-derived microbiota. Although alpha diversity was reduced compared to human donors, the microbial profiles of the colonized mice showed high intraindividual, remarkable temporal stability and a high transfer rate,. Analysis of the transplanted mouse microbiome at the level of individual taxa revealed several differences, including a significantly reduced abundance of the potentially autoimmune-protective genus Sutterella in mice colonized with MS-twin-derived microbiota. These findings provide first evidence that MS-derived microbiota contain factors that precipitate an MS-like autoimmune disease in a transgenic mouse model. This model lends itself to identify protective and pathogenic microbial component in human MS. </p>', 'abstract', 519, '2017-08-30 21:39:35', '2017-10-25 00:04:39'),
(1145, '<p>Study design. </p><p>MZ twins were recruited by launching a national televised appeal as well as internet notification in Germany with support from the German Multiple Sclerosis Society (DMSG). Inclusion criteria for study participation were met for MZ twins with an MS diagnosis according to the revised McDonald criteria or clinically isolated syndrome (CIS) in one twin only. Exclusion criteria were antibiotic, glucocorticosteroidal or immunosuppressive treatment, gastrointestinal infection or diet irregularities in the 3 months prior to study entry. In total, 34 pairs (see Table 1) visited the outpatient department at the Institute of Clinical Neuroimmunology in Munich for a detailed interview on past and present medical, family and social history, a neurological examination as well as a nutrition questionnaire. To confirm the MS diagnosis, medical records including MRI scans were obtained and reviewed. Fecal samples were either directly collected in hospital or taken at home, stored at -20°C and transferred to the hospital in cooling bags. Finally, all samples were stored at -80°C. Of all participants buccal swabs for zygosity testing were taken. The study was approved by the local Ethics Committee of the Ludwig-Maximilians University Munich and all participants gave written informed consent. </p><p>16S rRNA Sequencing and Analysis.</p><p>The V3-V5 region of bacterial 16S rRNA gene was amplified using the universal forward (5’-CCGTCAATTCMTTTGAGTTT-3’) and reverse primer (5’-ACTCCTA CGGGAGGCAGCAG-3’) incorporating the FLX Titanium adapters and a unique barcode sequence. PCR products were sequenced on a 454 GS FLX titanium pyrosequencer (454 Life Sciences, Branford, CT, USA) at BGI-Shenzhen. Analysis was performed using QIIME v1.9 as described (1). Essentially, amplicon sequences were quality-filtered and grouped to operational taxonomic units (OTUs) using SortMeRNA method (2) using GreenGenes version 13.8 97% dataset for closed reference. Sequences that did not match reference sequences in the GreenGenes database were dropped from the analysis. Taxonomy was assigned to the retained OTUs based on the GreenGenes reference sequence and the GreenGenes tree was used for all downstream phylogenetic community comparisons. Samples were filtered to at least 10000 sequences per sample and OTUs were filtered to retain only OTUs present in at least 5% of samples, covering at least 0.01% of total reads. After filtering, human samples were rarefied to 10975 sequences, while mouse samples were rarefied to 8137 sequences per sample, which were the lowest number of sequences per sample, respectively. For comparison between human and mouse samples, the human and mouse datasets were combined before OTU filtering and rarefaction. The resulting OTUs were filtered as described above and samples were rarefied to 6200 sequences per sample. Alpha diversity was calculated using phylogenetic diversity index method (3). For analysis of beta diversity, pairwise distance matrices were generated by phylogenetic metric of weighted UniFrac (4) and used for PCoA. For comparison of individual taxa, samples were not rarefied. Instead, OTU abundances were normalized using variance-stabilizing transformation and taxa distributions were compared using the Wald negative binomial test from the R software package DESeq2 (as described in (4, 5) with Benjamini-Hochberg correction for multiple comparisons. All statistical analyses of differences between individual bacterial species were performed using QIIME v.1.9 or R (packages DESeq2 and phyloseq). </p>', 'methods', 519, '2017-08-30 21:39:35', '2017-10-25 00:04:39'),
(1146, '<p>Two files are uploaded. The dataset contains both human and mice samples. </p><p>Max_Planck_Twin_metadata.txt: Contains the sample metadata</p><p>Max_Planck_Twin_OTU_table.txt: contains the normalized OTU abundances for each individual</p><p>OTU abundances were normalized using variance-stabilizing transformation and taxa distributions were compared using the Wald negative binomial test from the R software package DESeq2 (as described in (4, 5) with Benjamini-Hochberg correction for multiple comparisons.</p>', 'other', 519, '2017-08-30 21:39:35', '2017-10-25 00:04:39');


INSERT INTO `dcs_geo_location_places` (`id`, `geo_location_place`, `created_at`, `updated_at`)
VALUES
(164, 'Germany', '2017-08-21 18:20:45', '2017-08-21 18:20:45'),
(166, 'San Francisco, CA, USA', '2017-08-22 01:02:51', '2017-08-22 01:02:51'),
(167, 'New York, USA', '2017-08-22 01:03:15', '2017-08-22 01:03:15'),
(173, 'Germany', '2017-08-30 21:39:34', '2017-08-30 21:39:34'),
(174, 'San Francisco, CA, USA', '2017-08-30 21:39:34', '2017-08-30 21:39:34'),
(175, 'New York, USA', '2017-08-30 21:39:34', '2017-08-30 21:39:34');


INSERT INTO `dcs_geo_location_points` (`id`, `latitude`, `longitude`, `created_at`, `updated_at`)
VALUES
(120, 51.196755, 9.627430, '2017-08-21 18:20:45', '2017-08-21 18:20:45'),
(122, 37.778008, -122.431272, '2017-08-22 01:02:51', '2017-08-22 01:02:51'),
(123, 43.000350, -75.499900, '2017-08-22 01:03:15', '2017-08-22 01:03:15'),
(131, 51.196755, 9.627430, '2017-08-30 21:39:34', '2017-08-30 21:39:34'),
(132, 37.778008, -122.431272, '2017-08-30 21:39:34', '2017-08-30 21:39:34'),
(133, 43.000350, -75.499900, '2017-08-30 21:39:34', '2017-08-30 21:39:34');


INSERT INTO `dcs_geo_location_boxes` (`id`, `sw_latitude`, `ne_latitude`, `sw_longitude`, `ne_longitude`, `created_at`, `updated_at`)
VALUES
(160, 47.270352, 55.057375, 5.866003, 15.041490, '2017-08-21 18:20:45', '2017-08-21 18:20:45'),
(162, 37.708080, 37.832390, -122.514890, -122.356980, '2017-08-22 01:02:51', '2017-08-22 01:02:51'),
(172, 47.270352, 55.057375, 5.866003, 15.041490, '2017-08-30 21:39:34', '2017-08-30 21:39:34'),
(173, 37.708080, 37.832390, -122.514890, -122.356980, '2017-08-30 21:39:34', '2017-08-30 21:39:34');


INSERT INTO `dcs_geo_locations` (`id`, `place_id`, `point_id`, `box_id`, `created_at`, `updated_at`, `resource_id`)
VALUES
(224, 164, 120, 160, '2017-08-21 18:20:45', '2017-08-21 18:20:45', 494),
(226, 166, 122, 162, '2017-08-22 01:02:51', '2017-08-22 01:02:51', 494),
(227, 167, 123, NULL, '2017-08-22 01:03:15', '2017-08-22 01:03:15', 494),
(239, 173, 131, 172, '2017-08-30 21:39:35', '2017-08-30 21:39:35', 519),
(240, 174, 132, 173, '2017-08-30 21:39:35', '2017-08-30 21:39:35', 519),
(241, 175, 133, NULL, '2017-08-30 21:39:35', '2017-08-30 21:39:35', 519);


INSERT INTO `dcs_publication_years` (`id`, `publication_year`, `resource_id`, `created_at`, `updated_at`)
VALUES
(397, '2017', 494, '2017-08-22 19:34:58', '2017-08-22 19:34:58'),
(409, '2017', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_publishers` (`id`, `publisher`, `resource_id`, `created_at`, `updated_at`)
VALUES
(494, 'UC San Francisco', 502, '2017-08-23 00:56:21', '2017-08-23 00:56:21'),
(519, 'DataONE', 527, '2017-09-07 18:15:56', '2017-09-07 18:15:56');


INSERT INTO `dcs_related_identifiers` (`id`, `related_identifier`, `related_identifier_type`, `relation_type`, `related_metadata_scheme`, `scheme_URI`, `scheme_type`, `resource_id`, `created_at`, `updated_at`)
VALUES
(271, '10.1073/pnas.1711233114', 'doi', 'iscitedby', NULL, NULL, NULL, 494, '2017-08-22 19:14:29', '2017-08-22 19:14:29'),
(278, '10.1073/pnas.1711233114', 'doi', 'iscitedby', NULL, NULL, NULL, 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_resource_types` (`id`, `resource_type_general`, `resource_type`, `resource_id`, `created_at`, `updated_at`)
VALUES
(486, 'dataset', 'dataset', 494, '2017-08-21 17:55:42', '2017-08-21 17:55:42'),
(511, 'dataset', 'dataset', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_rights` (`id`, `rights`, `rights_uri`, `resource_id`, `created_at`, `updated_at`)
VALUES
(486, 'Creative Commons Attribution 4.0 International (CC BY 4.0)', 'https://creativecommons.org/licenses/by/4.0/', 494, '2017-08-21 17:55:42', '2017-08-21 17:55:42'),
(511, 'Creative Commons Attribution 4.0 International (CC BY 4.0)', 'https://creativecommons.org/licenses/by/4.0/', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_subjects` (`id`, `subject`, `subject_scheme`, `scheme_URI`, `created_at`, `updated_at`)
VALUES
(2923, 'Twins', 'PLOS Subject Area Thesaurus', 'https://github.com/PLOS/plos-thesaurus', '2017-02-21 20:17:47', '2017-02-21 20:17:47'),
(3303, 'Multiple sclerosis', 'PLOS Subject Area Thesaurus', 'https://github.com/PLOS/plos-thesaurus', '2017-02-21 20:18:28', '2017-02-21 20:18:28'),
(11318, 'gut microbiota', NULL, NULL, '2017-08-21 18:09:45', '2017-08-21 18:09:45');


INSERT INTO `dcs_subjects_stash_engine_resources` (`id`, `resource_id`, `subject_id`, `created_at`, `updated_at`)
VALUES
(1180, 494, 11318, '2017-08-21 18:09:45', '2017-08-21 18:09:45'),
(1181, 494, 3303, '2017-08-21 18:09:51', '2017-08-21 18:09:51'),
(1182, 494, 2923, '2017-08-21 18:09:55', '2017-08-21 18:09:55'),
(1206, 519, 11318, '2017-08-30 21:39:35', '2017-08-30 21:39:35'),
(1207, 519, 3303, '2017-08-30 21:39:35', '2017-08-30 21:39:35'),
(1208, 519, 2923, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_publishers` (`id`, `publisher`, `resource_id`, `created_at`, `updated_at`)
VALUES
(486, 'UC San Francisco', 494, '2017-08-21 17:55:42', '2017-08-21 17:55:42'),
(511, 'UC San Francisco', 519, '2017-08-30 21:39:35', '2017-08-30 21:39:35');


INSERT INTO `dcs_contributors` (`id`, `contributor_name`, `contributor_type`, `name_identifier_id`, `resource_id`, `created_at`, `updated_at`, `award_number`)
VALUES
(12, 'Center for Information Technology Research in the Interest of Society', 'funder', NULL, 11, '2016-11-16 23:48:53', '2016-11-16 23:48:53', '2015-321');


INSERT INTO `dcs_affiliations_contributors` (`id`, `affiliation_id`, `contributor_id`, `created_at`, `updated_at`)
VALUES
(1, 84, 382, '2018-08-20 19:07:54', '2018-08-20 19:07:54');


INSERT INTO `dcs_sizes` (`id`, `size`, `resource_id`, `created_at`, `updated_at`)
VALUES
(10, '18421', 494, '2016-11-16 23:49:25', '2016-11-16 23:49:25');


INSERT INTO `stash_engine_orcid_invitations` (`id`, `email`, `identifier_id`, `first_name`, `last_name`, `secret`, `orcid`, `invited_at`, `accepted_at`)
VALUES
(19, 'mconklin@ucmerced.edu', 327, 'Martha', 'Conklin', '_UhMed-hHfcv-tG4SjVY1A', NULL, '2017-09-29 19:55:03', NULL);
