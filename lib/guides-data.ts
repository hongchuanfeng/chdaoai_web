// In-depth tutorials and guides for using ChDaoAI tools effectively
export interface Guide {
  slug: string
  title: { en: string; zh: string }
  description: { en: string; zh: string }
  category: 'beginner' | 'intermediate' | 'advanced' | 'workflow'
  tool: string
  content: { en: string; zh: string }
  readingTime: { en: string; zh: string }
  difficulty: { en: string; zh: string }
}

export const guides: Guide[] = [
  {
    slug: 'getting-started-with-chdaoai',
    title: {
      en: 'Getting Started with ChDaoAI: A Complete Beginner\'s Guide',
      zh: 'ChDaoAI 入门指南：完整的初学者教程',
    },
    description: {
      en: 'New to ChDaoAI? This comprehensive guide walks you through account creation, navigating the platform, and making the most of every tool.',
      zh: 'ChDaoAI 新手？这份全面的指南将引导您完成账户创建、平台导航，并充分利用每个工具。',
    },
    category: 'beginner',
    tool: 'platform',
    readingTime: { en: '8 min read', zh: '8 分钟阅读' },
    difficulty: { en: 'Beginner', zh: '入门' },
    content: {
      en: `## Welcome to ChDaoAI

ChDaoAI is a comprehensive suite of AI-powered tools designed to help you work with images, videos, audio, PDFs, and more. Whether you're a content creator, small business owner, student, or hobbyist, our tools can save you time and help you produce professional-quality results.

## Creating Your Account

Getting started takes less than a minute:

1. Visit our homepage at chdaoai.com
2. Click the "Login" or "Sign Up" button in the top navigation
3. Enter your email address and create a password
4. Verify your email address
5. You will automatically receive 100 free credits to try any tool

Your account gives you access to all our tools with a single sign-in. No need to create separate accounts for each tool.

## Understanding Credits

Our credit system is simple and transparent:

- Each tool operation costs a certain number of credits based on complexity
- New users receive 100 free credits
- Free credits are perfect for trying out the platform
- Paid plans offer more credits at lower per-credit costs
- Credits never expire as long as your account is active

You can see your current credit balance at any time by visiting your profile page.

## Navigating the Platform

The main navigation is organized by tool category:

- **Image Tools**: Watermark removal, background removal, image editing, AI-generated images
- **Video Tools**: Watermark removal, text-to-video, video-to-text, video restoration
- **Audio Tools**: Format conversion, text-to-speech, voice separation, audio repair
- **Subtitle Tools**: Generation, translation, format conversion
- **PDF Tools**: Merge, split, convert, translate, watermark
- **QR & Barcode Tools**: Generation and recognition
- **Other Tools**: CSV processing, eBook management

## Your First Project: Remove a Watermark

Let's walk through a typical first project—removing a watermark from an image:

### Step 1: Navigate to the Tool

Click "Image Tools" in the main navigation, then select "Remove Watermark" from the dropdown menu.

### Step 2: Upload Your Image

Click the upload area or drag and drop your image file. We support JPG, PNG, and WebP formats up to 10MB.

### Step 3: Let AI Work

Our AI will automatically detect the watermark and process your image. This typically takes 5-15 seconds depending on image size.

### Step 4: Review and Download

Once processing is complete, you'll see a side-by-side comparison. If you're happy with the result, click "Download" to save the processed image. If you'd like to try again with different settings, you can do so without being charged additional credits.

## Best Practices for Best Results

Here are some tips for getting the best results from our tools:

- **Use high-quality source files**: Better input produces better output
- **Choose the right tool for the job**: Each tool is optimized for specific tasks
- **Take advantage of free trials**: Most tools offer a preview before you spend credits
- **Read the tool descriptions**: Each tool has specific requirements and limitations
- **Save your originals**: Always keep copies of your original files

## Getting Help

If you need help, we have several resources available:

- **Help Center**: Browse our guides and tutorials
- **Blog**: Read in-depth articles about AI tools and techniques
- **Contact Support**: Reach our team via the contact form
- **FAQ**: Find answers to common questions

We're constantly adding new content based on user feedback. If you have suggestions for guides or tutorials you'd like to see, please let us know.

## Next Steps

Now that you understand the basics, here are some things to try:

1. **Explore different tools**: Try at least one tool from each category
2. **Read the blog**: Our blog has in-depth articles on AI and image processing
3. **Follow our guides**: Check out our detailed tutorials for advanced techniques
4. **Subscribe for more credits**: If you find the tools useful, our paid plans offer better value

Welcome to the community, and happy creating!`,
      zh: `## 欢迎使用 ChDaoAI

ChDaoAI 是一套全面的 AI 驱动工具，旨在帮助您处理图像、视频、音频、PDF 等。无论您是内容创作者、小企业主、学生还是爱好者，我们的工具都可以节省您的时间并帮助您制作专业质量的结果。

## 创建您的账户

入门只需不到一分钟：

1. 访问我们的主页 chdaoai.com
2. 点击顶部导航中的"登录"或"注册"按钮
3. 输入您的电子邮件地址并创建密码
4. 验证您的电子邮件地址
5. 您将自动获得 100 个免费积分来尝试任何工具

您的账户允许您使用单一登录访问我们所有的工具。无需为每个工具创建单独的账户。

## 了解积分

我们的积分系统简单透明：

- 每个工具操作根据复杂性消耗一定数量的积分
- 新用户获得 100 个免费积分
- 免费积分非常适合试用平台
- 付费计划以更低的每次积分成本提供更多积分
- 只要您的账户处于活动状态，积分就不会过期

您可以随时通过访问您的个人资料页面查看您当前的积分余额。

## 平台导航

主导航按工具类别组织：

- **图像工具**：水印去除、背景去除、图像编辑、AI 生成图像
- **视频工具**：水印去除、文本转视频、视频转文本、视频修复
- **音频工具**：格式转换、文本转语音、人声分离、音频修复
- **字幕工具**：生成、翻译、格式转换
- **PDF 工具**：合并、拆分、转换、翻译、水印
- **二维码和条形码工具**：生成和识别
- **其他工具**：CSV 处理、电子书管理

## 您的第一个项目：去除水印

让我们走一个典型的第一个项目 —— 从图像中去除水印：

### 第 1 步：导航到工具

在主导航中点击"图像工具"，然后从下拉菜单中选择"去除水印"。

### 第 2 步：上传您的图像

点击上传区域或拖放您的图像文件。我们支持最大 10MB 的 JPG、PNG 和 WebP 格式。

### 第 3 步：让 AI 工作

我们的 AI 将自动检测水印并处理您的图像。这通常需要 5-15 秒，具体取决于图像大小。

### 第 4 步：查看和下载

处理完成后，您将看到并排比较。如果您对结果满意，点击"下载"以保存处理后的图像。如果您想使用不同设置重试，您可以这样做而不会被收取额外积分。

## 获得最佳结果的最佳实践

以下是一些从我们工具中获得最佳结果的提示：

- **使用高质量源文件**：更好的输入产生更好的输出
- **为工作选择合适的工具**：每个工具都针对特定任务进行了优化
- **利用免费试用**：大多数工具在您花费积分之前提供预览
- **阅读工具描述**：每个工具都有特定的要求和限制
- **保存您的原件**：始终保留原始文件的副本

## 获取帮助

如果您需要帮助，我们有多个可用资源：

- **帮助中心**：浏览我们的指南和教程
- **博客**：阅读有关 AI 工具和技术的深入文章
- **联系支持**：通过联系表单联系我们的团队
- **常见问题解答**：找到常见问题的答案

我们会根据用户反馈不断添加新内容。如果您对我们希望看到的指南或教程有建议，请告诉我们。

## 下一步

现在您已经了解了基础知识，以下是可以尝试的一些事情：

1. **探索不同的工具**：尝试每个类别中至少一个工具
2. **阅读博客**：我们的博客有有关 AI 和图像处理的深入文章
3. **关注我们的指南**：查看我们针对高级技术的详细教程
4. **订阅获取更多积分**：如果您觉得工具有用，我们的付费计划提供更好的价值

欢迎加入社区，祝您创作愉快！`,
    },
  },
  {
    slug: 'batch-processing-images',
    title: {
      en: 'How to Process Hundreds of Images Efficiently: Batch Processing Guide',
      zh: '如何高效处理数百张图像：批处理指南',
    },
    description: {
      en: 'Learn professional techniques for batch processing images. Save hours of repetitive work with these workflow tips and best practices.',
      zh: '学习专业的图像批处理技术。使用这些工作流提示和最佳实践节省数小时的重复工作。',
    },
    category: 'intermediate',
    tool: 'image-tools',
    readingTime: { en: '10 min read', zh: '10 分钟阅读' },
    difficulty: { en: 'Intermediate', zh: '中级' },
    content: {
      en: `## The Batch Processing Challenge

If you work with images professionally—whether for e-commerce, photography, or content creation—you've likely faced the challenge of processing many images with similar operations. Doing each one manually is time-consuming, error-prone, and often impractical.

This guide will show you how to handle batch processing efficiently, saving you hours of work and ensuring consistent results.

## When to Use Batch Processing

Batch processing is ideal for:

- **E-commerce product photos**: Hundreds of products need similar treatment
- **Real estate listings**: Standardizing property photos
- **Wedding photography**: Processing entire events with consistent settings
- **Content creation**: Preparing multiple images for blog posts or social media
- **Archive digitization**: Processing scanned photos or documents
- **Stock photography**: Preparing images for sale

If you find yourself doing the same operation on more than 10 images, batch processing is worth the setup time.

## Planning Your Batch Operation

Before starting, clarify these key details:

### 1. Define Your Goal

What is the desired end state for your images? Examples:
- All images resized to 2000x2000 with white background
- All images have watermarks removed and converted to WebP
- All images color-corrected and enhanced

Clear goals help you choose the right tools and settings.

### 2. Audit Your Source Files

Review your source files for:
- File format and consistency
- Resolution range
- Any that need special handling
- Total file size and storage requirements

### 3. Estimate Resources

Calculate:
- How long processing will take
- How many credits you'll need (for paid tools)
- How much storage the output will require

## Setting Up Your Workflow

A good batch workflow has these stages:

### Stage 1: Organization

Create a clear folder structure:
- Input folder for original files
- Working folder for intermediate files
- Output folder for final results
- Archive folder for completed projects

Use consistent naming conventions that include relevant information like date, project, and version.

### Stage 2: Preparation

Before batch processing:
- Back up your originals
- Verify file integrity
- Remove any files that don't need processing
- Organize files in the order you want them processed

### Stage 3: Processing

Run your batch operations:
- Start with a small test batch (5-10 files) to verify settings
- Adjust settings based on test results
- Process the full batch once settings are confirmed
- Monitor for any errors or unexpected results

### Stage 4: Quality Control

After processing:
- Spot-check a sample of files
- Verify all files are in the correct output location
- Check that file sizes and formats are as expected
- Address any files that need special handling

### Stage 5: Delivery

Final steps:
- Create deliverables in the required format
- Generate any necessary documentation
- Clean up intermediate files (after verifying success)
- Archive the project

## Common Batch Operations

### Batch Resize

Resize multiple images to consistent dimensions:

1. Sort images by aspect ratio
2. Process landscape and portrait images separately if needed
3. Use consistent resize settings
4. Verify the resize didn't distort important content

### Batch Watermark Removal

Remove watermarks from many images:

1. Group images by watermark style
2. Process each group separately for best results
3. Review results carefully—complex watermarks may need manual adjustment
4. Keep originals until you've verified all results

### Batch Format Conversion

Convert many images to a different format:

1. Verify all source images are valid
2. Choose appropriate quality settings for target format
3. Consider whether to preserve or strip metadata
4. Test conversion on a few files before batch

### Batch Color Correction

Apply consistent color treatment:

1. Choose a representative sample image
2. Apply your desired color adjustments
3. Test on a small batch to verify consistency
4. Adjust settings if needed, then process full batch

## Tools and Automation

### Built-in Batch Features

Many of our tools support batch processing natively. Look for:

- "Upload Multiple Files" option
- "Apply to All" or similar bulk operation buttons
- API access for programmatic processing

### API Integration

For high-volume needs, our API allows:

- Programmatic submission of processing jobs
- Webhook notifications when jobs complete
- Integration with your existing systems
- Custom workflow automation

### Command-Line Tools

For local processing:

- **ImageMagick**: Powerful command-line image processor
- **FFmpeg**: Excellent for video and audio, also handles images
- **libvips**: Fast image processing library
- **Sharp**: Node.js image processing library

## Time-Saving Tips

### Tip 1: Use Presets

Save your settings as presets so you don't have to reconfigure them every time. Most tools allow you to save and load presets.

### Tip 2: Process Overnight

For large batches, start processing before bed and let it run overnight. Use tools that provide progress notifications so you can check status in the morning.

### Tip 3: Parallelize When Possible

If you have multiple tools to apply, some can run in parallel. Just be careful with system resources—running too many heavy operations simultaneously can slow everything down.

### Tip 4: Keep a Log

Maintain a log of your batch operations, including:
- Date and time of operation
- Tools and settings used
- Number of files processed
- Any issues encountered
- Time taken

This log becomes invaluable when you need to repeat or troubleshoot similar operations.

### Tip 5: Version Your Output

Instead of overwriting previous output, save versions. This lets you compare results and revert if needed.

## Common Pitfalls to Avoid

### Pitfall 1: Not Testing First

Always test your settings on a small batch before running on hundreds of files. A small mistake can be costly at scale.

### Pitfall 2: Ignoring Edge Cases

Not all files in your batch will be the same. Identify files that need special handling and process them separately.

### Pitfall 3: Insufficient Storage

Make sure you have enough storage for both input and output. Running out of space mid-batch can corrupt files.

### Pitfall 4: No Backup

Always have a backup of your originals. If something goes wrong, you need to be able to start over.

### Pitfall 5: Forgetting Metadata

Decide whether to preserve or strip metadata before processing. For some uses, metadata is essential; for others, it should be removed for privacy.

## When to Get Help

If you're processing a very large batch or need consistent results across many projects, consider:

- Hiring a specialist for one-time setup
- Subscribing to higher-tier plans with priority processing
- Using API access for custom automation
- Reaching out to our support team for advice

The time investment in proper batch processing setup pays back many times over in saved effort and consistent results.`,
      zh: `## 批处理挑战

如果您专业地处理图像 —— 无论是用于电子商务、摄影还是内容创建 —— 您可能面临处理许多具有相似操作的图像的挑战。手动执行每个操作既耗时又容易出错，而且通常不切实际。

本指南将向您展示如何高效地处理批处理，为您节省数小时的工作并确保结果一致。

## 何时使用批处理

批处理在以下情况下是理想的：

- **电子商务产品照片**：数百种产品需要类似处理
- **房地产列表**：标准化房产照片
- **婚礼摄影**：使用一致的设置处理整个活动
- **内容创建**：为博客文章或社交媒体准备多个图像
- **档案数字化**：处理扫描的照片或文档
- **库存摄影**：准备待售图像

如果您发现自己对超过 10 个图像执行相同的操作，那么批处理值得花时间设置。

## 规划您的批处理操作

在开始之前，请澄清以下关键细节：

### 1. 定义您的目标

您的图像的期望最终状态是什么？示例：
- 所有图像调整为 2000x2000 并带有白色背景
- 所有图像已去除水印并转换为 WebP
- 所有图像已进行色彩校正和增强

明确的目标帮助您选择正确的工具和设置。

### 2. 审核您的源文件

检查您的源文件的：
- 文件格式和一致性
- 分辨率范围
- 任何需要特殊处理的文件
- 总文件大小和存储要求

### 3. 估计资源

计算：
- 处理将需要多长时间
- 您需要多少积分（用于付费工具）
- 输出将需要多少存储空间

## 设置您的工作流程

良好的批处理工作流具有以下阶段：

### 阶段 1：组织

创建清晰的文件夹结构：
- 原始文件的输入文件夹
- 中间文件的工作文件夹
- 最终结果的输出文件夹
- 已完成项目的归档文件夹

使用包含日期、项目和版本等相关信息的一致命名约定。

### 阶段 2：准备

在批处理之前：
- 备份您的原件
- 验证文件完整性
- 删除任何不需要处理的文件
- 按您希望处理的顺序组织文件

### 阶段 3：处理

运行您的批处理操作：
- 从小测试批次（5-10 个文件）开始以验证设置
- 根据测试结果调整设置
- 一旦确认设置，处理完整批次
- 监控任何错误或意外结果

### 阶段 4：质量控制

处理后：
- 抽查文件样本
- 验证所有文件是否在正确的输出位置
- 检查文件大小和格式是否符合预期
- 处理任何需要特殊处理的文件

### 阶段 5：交付

最后步骤：
- 以所需格式创建可交付成果
- 生成任何必要的文档
- 清理中间文件（在验证成功之后）
- 归档项目

## 常见批处理操作

### 批量调整大小

将多个图像调整到一致的尺寸：

1. 按宽高比对图像进行排序
2. 如需要，分别处理横向和纵向图像
3. 使用一致的调整大小设置
4. 验证调整大小没有扭曲重要内容

### 批量去水印

从许多图像中删除水印：

1. 按水印样式对图像进行分组
2. 分别处理每个组以获得最佳结果
3. 仔细查看结果 —— 复杂的水印可能需要手动调整
4. 保留原件直到您验证了所有结果

### 批量格式转换

将许多图像转换为不同的格式：

1. 验证所有源图像是否有效
2. 为目标格式选择适当的质量设置
3. 考虑是否保留或去除元数据
4. 在批处理之前在几个文件上测试转换

### 批量色彩校正

应用一致的颜色处理：

1. 选择一个代表性的样本图像
2. 应用您所需的颜色调整
3. 在小批次上测试以验证一致性
4. 必要时调整设置，然后处理完整批次

## 工具和自动化

### 内置批处理功能

我们的许多工具都原生支持批处理。寻找：

- "上传多个文件"选项
- "应用于所有"或类似的批量操作按钮
- 用于编程处理的 API 访问

### API 集成

对于高容量需求，我们的 API 允许：

- 以编程方式提交处理作业
- 作业完成时的 Webhook 通知
- 与您现有系统的集成
- 自定义工作流自动化

### 命令行工具

对于本地处理：

- **ImageMagick**：功能强大的命令行图像处理器
- **FFmpeg**：非常适合视频和音频，也处理图像
- **libvips**：快速图像处理库
- **Sharp**：Node.js 图像处理库

## 节省时间的技巧

### 技巧 1：使用预设

将您的设置保存为预设，这样您就不必每次都重新配置它们。大多数工具允许您保存和加载预设。

### 技巧 2：通宵处理

对于大批次，请在睡前开始处理并让它通宵运行。使用提供进度通知的工具，以便您可以在早上检查状态。

### 技巧 3：尽可能并行化

如果您有多个工具要应用，有些可以并行运行。只是要小心系统资源 —— 同时运行太多繁重的操作可能会减慢一切。

### 技巧 4：保留日志

维护您的批处理操作的日志，包括：
- 操作日期和时间
- 使用的工具和设置
- 处理的文件数
- 遇到的任何问题
- 花费的时间

当您需要重复或排查类似操作时，此日志变得非常宝贵。

### 技巧 5：版本化您的输出

不要覆盖以前的输出，而是保存版本。这使您可以比较结果并在需要时还原。

## 需要避免的常见陷阱

### 陷阱 1：不先测试

在数百个文件上运行之前，始终在小批次上测试您的设置。一个小错误在大规模上可能会代价高昂。

### 陷阱 2：忽略边缘情况

并非批次中的所有文件都相同。确定需要特殊处理的文件并单独处理它们。

### 陷阱 3：存储不足

确保您有足够的输入和输出存储空间。在批处理中途耗尽空间可能会损坏文件。

### 陷阱 4：没有备份

始终备份您的原件。如果出现问题，您需要能够重新开始。

### 陷阱 5：忘记元数据

在处理之前决定是保留还是去除元数据。对于某些用途，元数据是必不可少的；对于其他用途，出于隐私考虑应将其删除。

## 何时寻求帮助

如果您正在处理非常大的批次或需要在许多项目中获得一致的结果，请考虑：

- 聘请专家进行一次性设置
- 订阅具有优先处理功能的高级计划
- 使用 API 访问进行自定义自动化
- 联系我们的支持团队寻求建议

在适当的批处理设置中的时间投资通过节省的工作量和一致的结果多次回报。`,
    },
  },
  {
    slug: 'optimize-images-for-web',
    title: {
      en: 'Web Image Optimization: Speed Up Your Site by 50%+',
      zh: 'Web 图像优化：将您的网站速度提升 50%+',
    },
    description: {
      en: 'Slow images are the #1 cause of slow websites. Learn how to optimize your images for the web without sacrificing visual quality.',
      zh: '慢速图像是网站慢速的第一大原因。学习如何在不牺牲视觉质量的情况下为 Web 优化图像。',
    },
    category: 'intermediate',
    tool: 'image-tools',
    readingTime: { en: '9 min read', zh: '9 分钟阅读' },
    difficulty: { en: 'Intermediate', zh: '中级' },
    content: {
      en: `## Why Image Optimization Matters

If your website feels slow, images are probably the culprit. Studies consistently show that images account for 50% or more of total page weight on most websites. Optimizing images is often the single highest-impact change you can make to improve site performance.

Faster sites mean:
- Better user experience
- Higher search engine rankings
- More conversions and sales
- Lower bandwidth costs

## The Core Concepts

Three factors determine image performance:

### File Size

Smaller files download faster. The goal is to make images as small as possible while maintaining acceptable quality.

### Resolution

Higher resolution means more pixels to display, but also larger files. You need enough resolution for the display size, but not more.

### Format Choice

Different formats have different characteristics. Choosing the right format can dramatically reduce file sizes.

## Step-by-Step Optimization

### Step 1: Choose the Right Resolution

Match resolution to display size:

| Display Context | Recommended Width |
|----------------|-------------------|
| Mobile thumbnail | 400-600px |
| Desktop thumbnail | 600-800px |
| Mobile hero | 800-1200px |
| Desktop hero | 1920-2560px |
| Full-screen background | 2560-3840px |

For high-DPI displays (Retina), multiply by 2 for sharp display.

### Step 2: Choose the Right Format

- **JPG**: Photographs and complex images with many colors
- **PNG**: Images with transparency, sharp edges, or text
- **WebP**: Best balance of size and quality for most images
- **AVIF**: Best compression, but less compatible than WebP

### Step 3: Compress Appropriately

- JPG quality: 75-85% is usually optimal
- WebP quality: 75-85% equivalent
- AVIF quality: 60-75% equivalent (more efficient)

### Step 4: Use Responsive Images

Serve different sizes for different screens using the \`srcset\` attribute:

\`\`\`html
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w,
          image-800w.jpg 800w,
          image-1200w.jpg 1200w,
          image-1920w.jpg 1920w"
  sizes="(max-width: 600px) 400w,
         (max-width: 1200px) 800w,
         1200w"
  alt="Description"
/>
\`\`\`

### Step 5: Enable Lazy Loading

For images below the fold, use lazy loading:

\`\`\`html
<img src="image.jpg" loading="lazy" alt="Description" />
\`\`\`

This defers loading until images are about to enter the viewport.

## Advanced Techniques

### Modern Format with Fallback

Use the picture element to serve modern formats with fallback:

\`\`\`html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
\`\`\`

### CDN Delivery

Use a Content Delivery Network (CDN) to serve images from servers close to your users. This reduces latency and improves load times.

### Image Sprites

For small icons and UI elements, combine multiple images into a single sprite sheet. This reduces HTTP requests.

### SVG for Icons

For icons and simple graphics, use SVG. SVGs are vector-based, scale to any size, and typically have very small file sizes.

## Common Mistakes to Avoid

### Mistake 1: Using High-Resolution Images for Thumbnails

Don't use a 4K image for a 400px thumbnail. Resize to the actual display size.

### Mistake 2: Forgetting to Compress

Always run images through a compression tool. Raw images are typically 3-5x larger than necessary.

### Mistake 3: Using Wrong Format

Using PNG for photographs produces files 5-10x larger than necessary. Use JPG or WebP instead.

### Mistake 4: Not Using Lazy Loading

Without lazy loading, all images load immediately, even those users never see.

### Mistake 5: Ignoring Mobile

Mobile users often have slower connections. Optimize especially for mobile contexts.

## Measuring Results

Use these tools to measure image performance:

- **Google PageSpeed Insights**: Comprehensive performance analysis
- **GTmetrix**: Detailed waterfall charts
- **WebPageTest**: Multi-location testing
- **Chrome DevTools**: Local performance analysis

After optimization, you should see:
- Smaller total page size
- Faster image load times
- Better Largest Contentful Paint (LCP) score
- Improved overall page speed score

## Automation

For ongoing optimization, consider:

- Build-time optimization in your CI/CD pipeline
- Server-side optimization with tools like ImageMagick
- Real-time optimization with services like Cloudflare Images
- Automated responsive image generation

## Conclusion

Image optimization is one of the highest-impact, lowest-effort improvements you can make to your website. By following the practices in this guide, you can typically reduce image weight by 50-80% while maintaining excellent visual quality.

Start with your most-visited pages and biggest images. Measure the impact. Then expand to the rest of your site. The cumulative effect on user experience and search rankings can be substantial.

Remember: a fast website is a successful website. Users expect pages to load in under 3 seconds, and image optimization is usually the easiest way to meet that expectation.`,
      zh: `## 为什么图像优化很重要

如果您的网站感觉很慢，图像可能是罪魁祸首。研究一致表明，在大多数网站上，图像占总页面重量的 50% 或更多。优化图像通常是您可以做出的最有影响力的单一更改，以提高网站性能。

更快的网站意味着：
- 更好的用户体验
- 更高的搜索引擎排名
- 更多的转化和销售
- 更低的带宽成本

## 核心概念

三个因素决定图像性能：

### 文件大小

较小的文件下载速度更快。目标是在保持可接受质量的同时使图像尽可能小。

### 分辨率

更高的分辨率意味着更多的像素要显示，但也意味着更大的文件。您需要足够的分辨率以适应显示尺寸，但不需要更多。

### 格式选择

不同的格式具有不同的特性。选择正确的格式可以显著减小文件大小。

## 逐步优化

### 步骤 1：选择正确的分辨率

将分辨率与显示尺寸匹配：

| 显示上下文 | 推荐宽度 |
|----------------|-------------------|
| 移动缩略图 | 400-600px |
| 桌面缩略图 | 600-800px |
| 移动主图 | 800-1200px |
| 桌面主图 | 1920-2560px |
| 全屏背景 | 2560-3840px |

对于高 DPI 显示器（Retina），乘以 2 以获得清晰显示。

### 步骤 2：选择正确的格式

- **JPG**：具有许多颜色的照片和复杂图像
- **PNG**：具有透明度、清晰边缘或文本的图像
- **WebP**：大多数图像的大小和质量的最佳平衡
- **AVIF**：最佳压缩，但兼容性低于 WebP

### 步骤 3：适当压缩

- JPG 质量：75-85% 通常是最佳的
- WebP 质量：75-85% 等效
- AVIF 质量：60-75% 等效（更高效）

### 步骤 4：使用响应式图像

使用 \`srcset\` 属性为不同屏幕提供不同尺寸：

\`\`\`html
<img
  src="image-800w.jpg"
  srcset="image-400w.jpg 400w,
          image-800w.jpg 800w,
          image-1200w.jpg 1200w,
          image-1920w.jpg 1920w"
  sizes="(max-width: 600px) 400w,
         (max-width: 1200px) 800w,
         1200w"
  alt="Description"
/>
\`\`\`

### 步骤 5：启用延迟加载

对于首屏下方的图像，使用延迟加载：

\`\`\`html
<img src="image.jpg" loading="lazy" alt="Description" />
\`\`\`

这会将加载推迟到图像即将进入视口时。

## 高级技术

### 现代格式与后备

使用 picture 元素来提供现代格式并具有后备：

\`\`\`html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
\`\`\`

### CDN 交付

使用内容分发网络（CDN）从靠近用户的服务器提供图像。这减少了延迟并改善了加载时间。

### 图像精灵

对于小图标和 UI 元素，将多个图像合并到单个精灵表中。这减少了 HTTP 请求。

### SVG 用于图标

对于图标和简单图形，使用 SVG。SVG 是基于矢量的，可以缩放到任何大小，并且通常具有非常小的文件大小。

## 需要避免的常见错误

### 错误 1：对缩略图使用高分辨率图像

不要将 4K 图像用于 400px 缩略图。调整为实际显示尺寸。

### 错误 2：忘记压缩

始终通过压缩工具运行图像。原始图像通常比所需的大 3-5 倍。

### 错误 3：使用错误的格式

对照片使用 PNG 产生的文件比所需的大 5-10 倍。请改用 JPG 或 WebP。

### 错误 4：不使用延迟加载

没有延迟加载，所有图像都会立即加载，即使是用户从未看到的图像。

### 错误 5：忽略移动设备

移动用户通常有较慢的连接。专门针对移动环境进行优化。

## 衡量结果

使用这些工具来衡量图像性能：

- **Google PageSpeed Insights**：全面的性能分析
- **GTmetrix**：详细的水量图
- **WebPageTest**：多位置测试
- **Chrome DevTools**：本地性能分析

优化后，您应该会看到：
- 更小的总页面大小
- 更快的图像加载时间
- 更好的最大内容绘制（LCP）分数
- 改进的整体页面速度分数

## 自动化

对于持续优化，请考虑：

- 在您的 CI/CD 管道中进行构建时优化
- 使用 ImageMagick 等工具进行服务器端优化
- 使用 Cloudflare Images 等服务进行实时优化
- 自动响应式图像生成

## 结论

图像优化是您可以做出的最高影响、最低努力的改进之一。通过遵循本指南中的实践，您通常可以在保持出色视觉质量的同时将图像权重减少 50-80%。

从您访问量最大的页面和最大的图像开始。衡量影响。然后扩展到您网站的其余部分。对用户体验和搜索排名的累积效应可能是巨大的。

请记住：快速网站就是成功的网站。用户希望页面在 3 秒内加载，而图像优化通常是满足该期望的最简单方法。`,
    },
  },
  {
    slug: 'image-quality-best-practices',
    title: {
      en: 'Image Quality Best Practices for Professional Results',
      zh: '专业成果的图像质量最佳实践',
    },
    description: {
      en: 'A comprehensive guide to achieving professional-quality images for any use case, from web to print.',
      zh: '针对任何用例（从 Web 到印刷）实现专业质量图像的综合指南。',
    },
    category: 'beginner',
    tool: 'image-tools',
    readingTime: { en: '7 min read', zh: '7 分钟阅读' },
    difficulty: { en: 'Beginner', zh: '入门' },
    content: {
      en: `## What is Image Quality?

Image quality is a multi-dimensional concept that includes:

- **Sharpness**: How clearly details are rendered
- **Color accuracy**: How faithfully colors are reproduced
- **Dynamic range**: The range from darkest to brightest tones
- **Noise levels**: Unwanted grain or artifacts
- **Compression artifacts**: Visible effects of file compression

Professional-quality images excel in all these dimensions while maintaining reasonable file sizes.

## Resolution and DPI

DPI (dots per inch) determines how an image is printed:

- **Web**: 72 DPI is standard (though this is largely a convention)
- **Print**: 300 DPI for high quality
- **Large prints**: 150-300 DPI depending on viewing distance

To calculate print size from image dimensions:
- Width in inches = Pixel width ÷ DPI
- For 3000 pixels at 300 DPI: 10 inches wide

Always work at the highest resolution your source allows.

## Color Management

### Color Spaces

Different devices display colors differently. Color spaces define reproducible color ranges:

- **sRGB**: Standard for web, smallest color range, most compatible
- **Adobe RGB**: Wider range, used in professional photography and print
- **ProPhoto RGB**: Largest range, used in high-end workflows

For web use, sRGB is the safest choice. For print, Adobe RGB or ProPhoto RGB may be appropriate.

### Color Profiles

Embed ICC color profiles in your images to ensure consistent color across devices. Most image editing software handles this automatically.

## Sharpness and Detail

### Source Quality

The best way to ensure sharp images is to start with sharp source material:

- Use proper camera settings (aperture, shutter speed, ISO)
- Use tripods or image stabilization for low-light shots
- Use appropriate lenses for your subject

### Post-Processing

If your source isn't perfectly sharp, post-processing can help:

- **Unsharp Mask**: Traditional sharpening tool
- **Smart Sharpen**: More advanced, can target specific issues
- **High Pass Filter**: Allows targeted sharpening
- **AI Enhancement**: Newer tools can add impressive detail

Be careful not to over-sharpen, which creates halos and artifacts.

## Color Correction

### White Balance

White balance ensures whites appear white under different lighting conditions:

- **Auto white balance**: Quick but inconsistent
- **Preset white balance**: Choose from predefined options
- **Custom white balance**: Most accurate, requires reference
- **Manual in post**: Adjust in editing software

### Exposure

Proper exposure is critical:

- Avoid clipping highlights (pure white with no detail)
- Avoid crushing shadows (pure black with no detail)
- Use histogram to verify exposure
- RAW files give you much more exposure flexibility

### Saturation and Vibrance

Adjust color intensity:

- **Saturation**: Affects all colors equally
- **Vibrance**: Affects less-saturated colors more
- Subtle adjustments usually look most natural

## Noise Reduction

Digital noise is most visible in:

- Low-light photos (high ISO)
- Shadows
- Solid color areas

Reduce noise with:

- Built-in noise reduction tools (Lightroom, Photoshop)
- Specialized noise reduction software (Topaz DeNoise, DxO PureRAW)
- AI-powered tools that can preserve detail while reducing noise

Be careful: aggressive noise reduction can remove fine detail and make images look "plastic."

## Compression Without Quality Loss

The goal is to find the optimal balance between file size and visual quality:

### For Web

- JPG quality 75-85% for most images
- WebP or AVIF for modern browsers
- Test on actual devices to verify

### For Print

- JPG quality 95% or PNG for lossless
- 300 DPI at final print size
- Color profile appropriate for printing

### For Archival

- TIFF or PNG for lossless storage
- Original color profile preserved
- All metadata intact

## Workflow Recommendations

A professional workflow includes:

1. **Shoot in RAW** when possible for maximum flexibility
2. **Import and organize** with proper file structure
3. **Initial culling** to remove obviously bad shots
4. **Basic adjustments** (exposure, white balance, etc.)
5. **Detailed retouching** (spot removal, local adjustments)
6. **Sharpening and noise reduction**
7. **Export** at appropriate settings for intended use
8. **Backup** to multiple locations

## Common Quality Issues and Fixes

### Soft Images

- Check focus accuracy
- Increase shutter speed
- Use image stabilization
- Apply post-processing sharpening

### Color Cast

- Adjust white balance
- Use color correction tools
- Verify color profile settings

### Banding

- Use higher bit depth
- Add dithering
- Avoid extreme adjustments in 8-bit images

### Compression Artifacts

- Use higher quality settings
- Save in less lossy formats
- Avoid repeated saves in lossy formats

## Conclusion

Achieving professional image quality is about understanding the technical aspects and applying them consistently. Start with the best possible source material, use appropriate tools and settings, and always test your results on the actual viewing medium.

The practices in this guide apply whether you're processing one image or thousands, whether for web or print, whether for personal or professional use. The key is consistency—establish a workflow that produces reliable results and follow it every time.

For more specific guidance on particular image types or use cases, explore our other guides and blog articles. We're constantly adding new content to help you get the most out of your images.`,
      zh: `## 什么是图像质量？

图像质量是一个多维概念，包括：

- **清晰度**：细节呈现的清晰程度
- **颜色准确性**：颜色再现的忠实程度
- **动态范围**：从最暗到最亮色调的范围
- **噪声水平**：不需要的颗粒或伪影
- **压缩伪影**：文件压缩的可见效果

专业质量的图像在所有这些维度上都表现出色，同时保持合理的文件大小。

## 分辨率和 DPI

DPI（每英寸点数）决定图像的打印方式：

- **Web**：72 DPI 是标准（虽然这在很大程度上是约定）
- **印刷**：300 DPI 以获得高质量
- **大幅印刷**：150-300 DPI 取决于观看距离

从图像尺寸计算打印尺寸：
- 宽度（英寸）= 像素宽度 ÷ DPI
- 对于 300 DPI 下的 3000 像素：宽 10 英寸

始终以源允许的最高分辨率工作。

## 色彩管理

### 色彩空间

不同的设备以不同的方式显示颜色。色彩空间定义可重现的颜色范围：

- **sRGB**：Web 标准，最小的颜色范围，最兼容
- **Adobe RGB**：更宽的范围，用于专业摄影和印刷
- **ProPhoto RGB**：最大的范围，用于高端工作流程

对于 Web 使用，sRGB 是最安全的选择。对于印刷，Adobe RGB 或 ProPhoto RGB 可能是合适的。

### 色彩配置文件

在图像中嵌入 ICC 颜色配置文件以确保跨设备的一致颜色。大多数图像编辑软件会自动处理此问题。

## 清晰度和细节

### 源质量

确保清晰图像的最佳方法是从清晰的源材料开始：

- 使用适当的相机设置（光圈、快门速度、ISO）
- 在弱光下使用三脚架或图像稳定功能
- 为您的拍摄对象使用合适的镜头

### 后期处理

如果您的源不完美清晰，后期处理可以提供帮助：

- **USM 锐化**：传统锐化工具
- **智能锐化**：更高级，可以针对特定问题
- **高反差保留滤镜**：允许有针对性的锐化
- **AI 增强**：较新的工具可以添加令人印象深刻的细节

注意不要过度锐化，这会产生光晕和伪影。

## 色彩校正

### 白平衡

白平衡确保白色在不同光照条件下看起来是白色的：

- **自动白平衡**：快速但不一致
- **预设白平衡**：从预定义选项中选择
- **自定义白平衡**：最准确，需要参考
- **手动后期**：在编辑软件中调整

### 曝光

正确的曝光至关重要：

- 避免剪切高光（纯白色没有细节）
- 避免压碎阴影（纯黑色没有细节）
- 使用直方图验证曝光
- RAW 文件为您提供更大的曝光灵活性

### 饱和度和鲜艳度

调整颜色强度：

- **饱和度**：等量影响所有颜色
- **鲜艳度**：对饱和度较低的颜色影响更大
- 微妙的调整通常看起来最自然

## 降噪

数字噪声在以下情况下最明显：

- 弱光照片（高 ISO）
- 阴影
- 纯色区域

使用以下方法降噪：

- 内置降噪工具（Lightroom、Photoshop）
- 专业降噪软件（Topaz DeNoise、DxO PureRAW）
- AI 驱动的工具可以在降噪的同时保留细节

注意：激进的降噪会去除精细的细节并使图像看起来"塑料"。

## 无质量损失的压缩

目标是找到文件大小和视觉质量之间的最佳平衡：

### 对于 Web

- 大多数图像的 JPG 质量为 75-85%
- 现代浏览器使用 WebP 或 AVIF
- 在实际设备上测试以验证

### 对于印刷

- JPG 质量 95% 或 PNG 以获得无损
- 最终打印尺寸下 300 DPI
- 适合打印的颜色配置文件

### 对于归档

- TIFF 或 PNG 以获得无损存储
- 保留原始颜色配置文件
- 保留所有元数据

## 工作流程建议

专业工作流程包括：

1. **尽可能以 RAW 拍摄**以获得最大灵活性
2. **导入和组织**具有适当的文件结构
3. **初始筛选**以删除明显糟糕的镜头
4. **基本调整**（曝光、白平衡等）
5. **详细的修饰**（斑点去除、局部调整）
6. **锐化和降噪**
7. **以适当的设置导出**以供预期使用
8. **备份**到多个位置

## 常见质量问题及修复

### 图像柔和

- 检查对焦精度
- 增加快门速度
- 使用图像稳定功能
- 应用后期处理锐化

### 偏色

- 调整白平衡
- 使用色彩校正工具
- 验证颜色配置文件设置

### 条带

- 使用更高的位深度
- 添加抖动
- 避免在 8 位图像中进行极端调整

### 压缩伪影

- 使用更高的质量设置
- 以较少有损的格式保存
- 避免以有损格式重复保存

## 结论

实现专业图像质量涉及了解技术方面并一致地应用它们。从尽可能最好的源材料开始，使用适当的工具和设置，并始终在实际查看介质上测试您的结果。

无论您是处理一张图像还是数千张，无论是用于 Web 还是印刷，无论是用于个人还是专业用途，本指南中的实践都适用。关键是一致性 —— 建立一个能产生可靠结果的工作流程，并每次都遵循它。

有关特定图像类型或用例的更具体指导，请探索我们的其他指南和博客文章。我们不断添加新内容以帮助您充分利用图像。`,
    },
  },
  {
    slug: 'create-subtitles-for-videos',
    title: {
      en: 'How to Create Professional Subtitles for Your Videos',
      zh: '如何为您的视频创建专业字幕',
    },
    description: {
      en: 'Subtitles make your videos accessible to a wider audience. This guide covers everything from automatic generation to manual creation.',
      zh: '字幕使您的视频可以被更广泛的受众所访问。本指南涵盖了从自动生成到手动创建的所有内容。',
    },
    category: 'beginner',
    tool: 'subtitle-tools',
    readingTime: { en: '8 min read', zh: '8 分钟阅读' },
    difficulty: { en: 'Beginner', zh: '入门' },
    content: {
      en: `## Why Subtitles Matter

Subtitles are essential for modern video content:

- **Accessibility**: 5% of the world's population has hearing loss
- **Global reach**: Most YouTube views come from non-native speakers
- **Engagement**: 80% of viewers are more likely to finish videos with captions
- **SEO**: Subtitles improve discoverability through text content
- **Noisy environments**: Many people watch videos without sound

Adding subtitles is one of the highest-ROI improvements you can make to your video content.

## Types of Subtitles

### Open vs. Closed Captions

- **Open captions**: Burned into the video, always visible
- **Closed captions**: Toggleable, stored in separate file or track

### Subtitles vs. Captions

- **Subtitles**: Text version of spoken dialogue (assumes viewer can hear)
- **Captions**: Include all audio (sound effects, speaker ID, music)

For accessibility, you need captions. For other uses, subtitles are usually sufficient.

## Automatic Subtitle Generation

AI-powered tools can generate subtitles automatically:

### How It Works

1. Audio is extracted from the video
2. Speech recognition converts audio to text
3. Timing information is added
4. Result is exported as subtitle file

### Pros

- Very fast (minutes for a 1-hour video)
- Low cost
- Good for first draft
- Multiple language support

### Cons

- Not always accurate
- May miss speaker changes
- Doesn't include non-speech audio
- May have timing issues

### Best Practice

Use auto-generation as a starting point, then review and correct. This gives you the speed of automation with the accuracy of human review.

## Manual Subtitle Creation

For highest quality, create subtitles manually:

### Tools

- **Subtitle Edit**: Free, feature-rich Windows editor
- **Aegisub**: Free, popular for advanced subtitles
- **Online editors**: Quick and easy, no software needed

### Workflow

1. Watch the video and note timing for each line
2. Type the text as you hear it
3. Adjust timing for natural reading
4. Review and refine
5. Export in the desired format

### Tips

- Break lines at natural phrase boundaries
- Keep lines to about 40 characters
- Display each line for at least 1.5 seconds
- Use consistent formatting throughout

## Subtitle Best Practices

### Timing

- **Minimum display time**: 1 second
- **Maximum display time**: 6-7 seconds
- **Reading speed**: 15-20 characters per second
- **Gap between subtitles**: 4-8 frames minimum

### Formatting

- **Font**: Sans-serif (Arial, Helvetica) for readability
- **Size**: 5-7% of video height
- **Color**: White with black outline or shadow
- **Position**: Bottom center (standard)

### Accessibility

- Include speaker identification for multiple speakers
- Add sound effects in brackets: [music plays], [door opens]
- Use proper punctuation
- Consider italic for off-screen speakers or thoughts

## Translating Subtitles

To reach international audiences, translate your subtitles:

### Translation Services

- **Professional translators**: Highest quality, most expensive
- **Crowdsourced platforms**: Good balance of cost and quality
- **Machine translation**: Fastest, lowest quality, needs review
- **Hybrid approach**: Machine + human review

### Workflow

1. Start with accurate original subtitles
2. Translate to target language(s)
3. Adjust timing for different text lengths
4. Have native speaker review
5. Verify technical accuracy (no overflow, proper sync)

## Adding Subtitles to Videos

### YouTube

1. Upload your video
2. Go to Subtitles/CC in the video details
3. Upload subtitle file or use auto-sync
4. Review and publish

### Vimeo

1. Go to video settings
2. Click "Distribution" then "Subtitles"
3. Upload subtitle file
4. Set language and save

### Social Media

Most social platforms don't support external subtitle files. Options:

- Burn subtitles into the video before uploading
- Use platform-specific features (Instagram, TikTok have caption tools)
- Add captions in your video editing software

## Common Issues and Solutions

### Timing Drift

If subtitles gradually become out of sync, check for:

- Variable frame rate issues
- Audio/video sync problems in source
- Errors in your subtitle timing

### Text Overflow

When translated text doesn't fit:

- Shorten the translation
- Split into two lines
- Increase display time
- Use smaller font

### Special Characters

For non-English languages:

- Ensure UTF-8 encoding
- Verify font supports required characters
- Test rendering in target video player

## Subtitle Formats

Different platforms and players prefer different formats:

- **SRT**: Most widely supported, simple text format
- **WebVTT**: Web standard, used by HTML5 video
- **TTML**: Professional broadcasting standard
- **ASS**: Advanced formatting, used in anime/karaoke

For maximum compatibility, use SRT. For web-specific use, WebVTT is the standard.

## Conclusion

Subtitles are essential for video content in today's global, accessible, and noisy world. Whether you choose automatic generation, manual creation, or a hybrid approach, the key is consistency and quality.

Start with auto-generation for speed, then review and correct. Use clear formatting, accurate timing, and proper accessibility features. For international audiences, invest in quality translation.

The time you invest in good subtitles pays back many times over in increased reach, engagement, and accessibility. It's one of the highest-ROI improvements you can make to your video content.`,
      zh: `## 为什么字幕很重要

字幕对于现代视频内容至关重要：

- **可访问性**：世界上 5% 的人口有听力损失
- **全球覆盖**：大多数 YouTube 观看来自非母语人士
- **参与度**：80% 的观众更有可能完成带字幕的视频
- **SEO**：字幕通过文本内容提高可发现性
- **嘈杂环境**：许多人在没有声音的情况下观看视频

添加字幕是您可以对视频内容进行的最高 ROI 改进之一。

## 字幕类型

### 开放与隐藏字幕

- **开放字幕**：烘焙到视频中，始终可见
- **隐藏字幕**：可切换，存储在单独的文件或轨道中

### 字幕与说明

- **字幕**：口语对话的文本版本（假设观众可以听到）
- **说明**：包括所有音频（声音效果、说话人 ID、音乐）

为了可访问性，您需要说明。对于其他用途，字幕通常就足够了。

## 自动字幕生成

AI 驱动的工具可以自动生成字幕：

### 工作原理

1. 从视频中提取音频
2. 语音识别将音频转换为文本
3. 添加时间信息
4. 结果导出为字幕文件

### 优点

- 非常快（一小时视频只需几分钟）
- 低成本
- 适合初稿
- 支持多种语言

### 缺点

- 并不总是准确
- 可能会漏掉说话人变化
- 不包括非语音音频
- 可能存在时间问题

### 最佳实践

使用自动生成作为起点，然后查看和更正。这为您提供了自动化的速度和人工审查的准确性。

## 手动字幕创建

为了获得最高质量，请手动创建字幕：

### 工具

- **Subtitle Edit**：免费的、功能丰富的 Windows 编辑器
- **Aegisub**：免费的，流行于高级字幕
- **在线编辑器**：快速简便，无需软件

### 工作流程

1. 观看视频并记录每行的时间
2. 听到时键入文本
3. 调整时间以实现自然阅读
4. 查看和优化
5. 以所需格式导出

### 提示

- 在自然短语边界处换行
- 每行保持约 40 个字符
- 每行至少显示 1.5 秒
- 整个过程中使用一致的格式

## 字幕最佳实践

### 时间安排

- **最短显示时间**：1 秒
- **最长显示时间**：6-7 秒
- **阅读速度**：每秒 15-20 个字符
- **字幕之间的间隔**：最少 4-8 帧

### 格式

- **字体**：无衬线（Arial、Helvetica）以提高可读性
- **大小**：视频高度的 5-7%
- **颜色**：白色带黑色轮廓或阴影
- **位置**：底部居中（标准）

### 可访问性

- 为多个说话人包括说话人识别
- 在方括号中添加声音效果：[音乐播放]、[门打开]
- 使用正确的标点符号
- 考虑对屏幕外的说话人或想法使用斜体

## 翻译字幕

要接触国际观众，请翻译您的字幕：

### 翻译服务

- **专业翻译人员**：质量最高，最昂贵
- **众包平台**：成本和质量的良好平衡
- **机器翻译**：最快，质量最低，需要审查
- **混合方法**：机器 + 人工审查

### 工作流程

1. 从准确的原始字幕开始
2. 翻译为目标语言
3. 针对不同的文本长度调整时间
4. 让母语人士审查
5. 验证技术准确性（无溢出、正确同步）

## 向视频添加字幕

### YouTube

1. 上传您的视频
2. 在视频详细信息中转到字幕/CC
3. 上传字幕文件或使用自动同步
4. 查看并发布

### Vimeo

1. 转到视频设置
2. 点击"分发"然后"字幕"
3. 上传字幕文件
4. 设置语言并保存

### 社交媒体

大多数社交平台不支持外部字幕文件。选项：

- 在上传前将字幕烘焙到视频中
- 使用平台特定功能（Instagram、TikTok 有字幕工具）
- 在您的视频编辑软件中添加字幕

## 常见问题及解决方案

### 时间漂移

如果字幕逐渐变得不同步，请检查：

- 可变帧速率问题
- 源中的音频/视频同步问题
- 字幕时间错误

### 文本溢出

当翻译文本不适合时：

- 缩短翻译
- 拆分为两行
- 增加显示时间
- 使用较小的字体

### 特殊字符

对于非英语语言：

- 确保 UTF-8 编码
- 验证字体支持所需字符
- 在目标视频播放器中测试渲染

## 字幕格式

不同的平台和播放器首选不同的格式：

- **SRT**：支持最广泛，简单的文本格式
- **WebVTT**：Web 标准，由 HTML5 视频使用
- **TTML**：专业广播标准
- **ASS**：高级格式，用于动漫/卡拉 OK

为了最大兼容性，请使用 SRT。对于特定于 Web 的用途，WebVTT 是标准。

## 结论

在当今全球、可访问和嘈杂的世界中，字幕对于视频内容至关重要。无论您选择自动生成、手动创建还是混合方法，关键是一致性和质量。

从自动生成开始以提高速度，然后查看和更正。使用清晰的格式、准确的时间和适当的可访问性功能。对于国际观众，投资于高质量的翻译。

您在优质字幕上投入的时间将通过增加覆盖面、参与度和可访问性多次回报。这是您可以对视频内容进行的最高 ROI 改进之一。`,
    },
  },
  {
    slug: 'pdf-merge-best-practices',
    title: {
      en: 'How to Merge PDFs Like a Pro: Tips and Best Practices',
      zh: '像专业人士一样合并 PDF：技巧和最佳实践',
    },
    description: {
      en: 'Merging PDFs seems simple, but doing it well requires attention to detail. This guide covers professional techniques for clean, well-organized merged documents.',
      zh: '合并 PDF 看起来很简单，但要做好需要关注细节。本指南涵盖了干净、组织良好的合并文档的专业技术。',
    },
    category: 'intermediate',
    tool: 'pdf-tools',
    readingTime: { en: '6 min read', zh: '6 分钟阅读' },
    difficulty: { en: 'Intermediate', zh: '中级' },
    content: {
      en: `## Why Merge PDFs?

PDF merging is one of the most common document tasks. Common reasons include:

- **Combining reports**: Multi-part reports into single document
- **Compiling invoices**: Monthly billing packages
- **Creating portfolios**: Work samples for clients
- **Legal documents**: Multi-party contracts with appendices
- **Academic submissions**: Manuscripts with supplementary materials
- **Email attachments**: Reducing number of attachments

A well-merged PDF is easier to share, archive, and reference than multiple separate files.

## Before You Merge

### Audit Your Files

Check each PDF before merging:

- **Page count**: Note the total number of pages
- **Page size**: Are all pages the same size?
- **Orientation**: Mix of portrait and landscape?
- **File names**: Will the merged name make sense?
- **Content order**: What's the logical reading order?

### Identify Issues

Look for potential problems:

- **Password protection**: Remove passwords before merging
- **Corrupted files**: Some PDFs may be damaged
- **Unusual formats**: Scanned PDFs may need OCR first
- **Very large files**: May need compression before merging

### Plan the Structure

Decide on:

- **Table of contents**: Do you need one?
- **Page numbering**: Should pages be renumbered?
- **Bookmarks**: Add navigation for longer documents?
- **Section breaks**: Where to separate sections?

## Merging Methods

### Online Tools

For occasional merging:

- Fast and convenient
- No software to install
- Privacy considerations (uploading to server)
- Good for non-sensitive documents

### Desktop Software

For regular use:

- Adobe Acrobat: Industry standard, comprehensive
- PDFsam: Free, open source, focused on PDF manipulation
- Preview (Mac): Basic but functional
- Various Office suites include basic PDF tools

### Command-Line Tools

For automation:

- **pdftk**: Powerful command-line PDF toolkit
- **qpdf**: Modern alternative to pdftk
- **Ghostscript**: Can do many PDF operations
- **Python with PyPDF2 or pypdf**: Programmatic control

### APIs

For integration into applications:

- Most cloud services offer PDF APIs
- Allows automation at scale
- Costs scale with usage

## Best Practices

### Maintain Quality

- Use lossless merging when possible
- Avoid re-compression during merge
- Preserve original quality of each component
- Check final file size is reasonable

### Preserve Functionality

Modern PDFs have many features beyond text:

- **Forms**: Interactive form fields
- **Bookmarks**: Navigation aids
- **Annotations**: Comments and markups
- **Multimedia**: Audio, video, 3D content
- **Digital signatures**: Authentication

A good merge preserves all of these where appropriate.

### Optimize After Merging

Once merged, you can:

- **Add bookmarks**: For navigation
- **Generate table of contents**: For long documents
- **Compress**: If file is too large
- **Add metadata**: Title, author, subject
- **Apply security**: Passwords or restrictions

## Common Issues and Solutions

### Mixed Page Sizes

When combining documents with different page sizes:

- Option 1: Keep original sizes (mixed page layout)
- Option 2: Standardize all to one size (e.g., A4 or Letter)
- Option 3: Scale smaller pages to fit larger ones

Choose based on the document's purpose.

### Mixed Orientations

For documents mixing portrait and landscape:

- Use the orientation that best fits each section
- Accept the mixed result
- Or rotate pages to a single orientation

### Outdated Fonts

If merged PDFs use different fonts:

- Embed fonts in the final document
- Convert to standard fonts where possible
- Verify appearance after merging

### File Size Explosion

If the merged file is too large:

- Compress images within the PDF
- Remove unnecessary elements
- Use PDF optimization tools
- Consider splitting very large documents

### Bookmarks and Links Broken

Internal links and bookmarks may break:

- Verify links work after merging
- Update or recreate broken links
- Add new bookmarks for the merged structure

## Advanced Techniques

### Section-Based Merging

For complex documents:

1. Create separate PDFs for each section
2. Add section bookmarks before merging
3. Add introductory pages with table of contents
4. Apply consistent formatting

### Bates Numbering

For legal documents:

- Add sequential page numbers
- Apply consistent formatting
- Include document identifier
- Common in legal discovery

### Redaction

For sensitive content:

- Redact before merging, not after
- Use proper redaction tools (not visual overlays)
- Verify redaction is permanent
- Document what was redacted

### Form Field Handling

When merging documents with forms:

- Decide whether to flatten forms (non-editable)
- Or preserve forms for continued editing
- Test form behavior after merging
- Consider merging form data into a single database

## Workflow Examples

### Monthly Invoice Package

1. Export each invoice as separate PDF
2. Add cover page with summary
3. Optionally add table of contents
4. Merge in date order
5. Apply password protection if sensitive
6. Compress if emailing

### Legal Contract

1. Gather all contract sections as separate PDFs
2. Add cover page with parties and date
3. Merge in document order
4. Add bookmarks for each section
5. Add signature page
6. Apply digital signature
7. Restrict editing with password

### Academic Manuscript

1. Main manuscript PDF
2. Figures and tables as separate PDFs
3. Supplementary materials
4. Cover letter
5. Merge in submission order
6. Generate table of contents
7. Apply any required formatting

## Automation Tips

For repetitive merging tasks:

- **Templates**: Create reusable cover pages and structures
- **Scripts**: Automate with command-line tools or Python
- **Watched folders**: Auto-process new files
- **Standardization**: Establish naming conventions and structures

## Conclusion

PDF merging is a common but important task. Taking time to plan, audit files, and apply best practices results in documents that are easier to share, navigate, and archive.

The key principles are: maintain quality, preserve functionality, plan structure, and optimize after merging. Whether you're combining two PDFs or two hundred, these practices ensure professional results.

For specific use cases like legal documents, academic submissions, or business reports, the workflow may vary, but the underlying principles remain the same. With the right approach, PDF merging becomes a smooth, reliable part of your document workflow.`,
      zh: `## 为什么要合并 PDF？

PDF 合并是最常见的文档任务之一。常见原因包括：

- **合并报告**：多部分报告合并为单个文档
- **汇编发票**：每月计费包
- **创建作品集**：客户的工作样本
- **法律文档**：带附录的多方合同
- **学术提交**：带补充材料的手稿
- **电子邮件附件**：减少附件数量

与多个单独的文件相比，良好合并的 PDF 更易于共享、归档和参考。

## 在合并之前

### 审核您的文件

在合并之前检查每个 PDF：

- **页数**：记下总页数
- **页面大小**：所有页面的大小都相同吗？
- **方向**：纵向和横向混合？
- **文件名**：合并后的名称是否有意义？
- **内容顺序**：什么是逻辑阅读顺序？

### 识别问题

查找潜在问题：

- **密码保护**：在合并之前删除密码
- **损坏的文件**：某些 PDF 可能已损坏
- **不寻常的格式**：扫描的 PDF 可能首先需要 OCR
- **非常大的文件**：合并前可能需要压缩

### 规划结构

决定：

- **目录**：您需要一个吗？
- **页码**：应该重新编号吗？
- **书签**：为较长的文档添加导航？
- **分节符**：在哪里分隔章节？

## 合并方法

### 在线工具

对于偶尔合并：

- 快速方便
- 无需安装软件
- 隐私考虑（上传到服务器）
- 适合非敏感文档

### 桌面软件

对于常规使用：

- Adobe Acrobat：行业标准，全面
- PDFsam：免费、开源，专注于 PDF 操作
- Preview（Mac）：基本但功能齐全
- 各种 Office 套件包括基本的 PDF 工具

### 命令行工具

对于自动化：

- **pdftk**：功能强大的命令行 PDF 工具包
- **qpdf**：pdftk 的现代替代品
- **Ghostscript**：可以执行许多 PDF 操作
- **带 PyPDF2 或 pypdf 的 Python**：编程控制

### API

对于集成到应用程序中：

- 大多数云服务提供 PDF API
- 允许大规模自动化
- 成本随使用量而变化

## 最佳实践

### 保持质量

- 尽可能使用无损合并
- 合并期间避免重新压缩
- 保留每个组件的原始质量
- 检查最终文件大小是否合理

### 保留功能

现代 PDF 超越文本具有许多功能：

- **表单**：交互式表单字段
- **书签**：导航辅助
- **注释**：评论和标记
- **多媒体**：音频、视频、3D 内容
- **数字签名**：身份验证

良好的合并在适当的情况下保留所有这些内容。

### 合并后优化

合并后，您可以：

- **添加书签**：用于导航
- **生成目录**：用于长文档
- **压缩**：如果文件太大
- **添加元数据**：标题、作者、主题
- **应用安全**：密码或限制

## 常见问题及解决方案

### 混合页面大小

在合并具有不同页面大小的文档时：

- 选项 1：保持原始大小（混合页面布局）
- 选项 2：将所有内容标准化为一种大小（例如 A4 或 Letter）
- 选项 3：将较小的页面缩放以适应较大的页面

根据文档的用途选择。

### 混合方向

对于混合纵向和横向的文档：

- 使用最适合每个部分的方向
- 接受混合结果
- 或将页面旋转到单一方向

### 过时的字体

如果合并的 PDF 使用不同的字体：

- 在最终文档中嵌入字体
- 尽可能转换为标准字体
- 合并后验证外观

### 文件大小爆炸

如果合并的文件太大：

- 压缩 PDF 中的图像
- 删除不必要的元素
- 使用 PDF 优化工具
- 考虑拆分非常大的文档

### 书签和链接损坏

内部链接和书签可能会损坏：

- 合并后验证链接是否有效
- 更新或重新创建断开的链接
- 为合并结构添加新书签

## 高级技术

### 基于部分的合并

对于复杂文档：

1. 为每个部分创建单独的 PDF
2. 在合并之前添加部分书签
3. 添加带目录的介绍页
4. 应用一致的格式

### Bates 编号

对于法律文档：

- 添加顺序页码
- 应用一致的格式
- 包括文档标识符
- 常见于法律发现

### 编辑删除

对于敏感内容：

- 在合并之前编辑删除，而不是之后
- 使用适当的编辑删除工具（不是视觉覆盖）
- 验证编辑删除是永久的
- 记录编辑删除了什么

### 表单字段处理

在合并带表单的文档时：

- 决定是否拼合表单（不可编辑）
- 或保留表单以供继续编辑
- 合并后测试表单行为
- 考虑将表单数据合并到单个数据库中

## 工作流程示例

### 每月发票包

1. 将每张发票导出为单独的 PDF
2. 添加带摘要的封面页
3. 可选择添加目录
4. 按日期顺序合并
5. 如果敏感则应用密码保护
6. 如果通过电子邮件发送则压缩

### 法律合同

1. 将所有合同部分收集为单独的 PDF
2. 添加带当事方和日期的封面页
3. 按文档顺序合并
4. 为每个部分添加书签
5. 添加签名页
6. 应用数字签名
7. 用密码限制编辑

### 学术手稿

1. 主要手稿 PDF
2. 单独的 PDF 中的图表
3. 补充材料
4. 求职信
5. 按提交顺序合并
6. 生成目录
7. 应用任何必需的格式

## 自动化提示

对于重复合并任务：

- **模板**：创建可重复使用的封面页和结构
- **脚本**：使用命令行工具或 Python 自动化
- **监视的文件夹**：自动处理新文件
- **标准化**：建立命名约定和结构

## 结论

PDF 合并是一项常见但重要的任务。花时间规划、审核文件并应用最佳实践会产生更易于共享、导航和归档的文档。

关键原则是：保持质量、保留功能、规划结构并在合并后进行优化。无论您是合并两个 PDF 还是两百个 PDF，这些实践都可确保专业的结果。

对于法律文档、学术提交或商业报告等特定用例，工作流程可能会有所不同，但基本原则保持不变。通过正确的方法，PDF 合并成为您文档工作流程中顺畅、可靠的一部分。`,
    },
  },
]

export const guideCategories = [
  { id: 'all', name: { en: 'All Guides', zh: '所有指南' } },
  { id: 'beginner', name: { en: 'Beginner', zh: '入门' } },
  { id: 'intermediate', name: { en: 'Intermediate', zh: '中级' } },
  { id: 'advanced', name: { en: 'Advanced', zh: '高级' } },
  { id: 'workflow', name: { en: 'Workflows', zh: '工作流程' } },
]

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find(g => g.slug === slug)
}

export function getRelatedGuides(slug: string, limit: number = 3): Guide[] {
  const current = getGuideBySlug(slug)
  if (!current) return []
  return guides
    .filter(g => g.slug !== slug && (g.category === current.category || g.tool === current.tool))
    .slice(0, limit)
}
